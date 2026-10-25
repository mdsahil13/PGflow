/** PGFlow Google Apps Script API. Set SPREADSHEET_ID in Script Properties before deploying. */
const PGFLOW = {
  VERSION: '1.1.0',
  SHEETS: {
    Students: ['Student ID','Name','Email','Room No','Monthly Rent','Due Date','Payment Status','Reminder Status','Last Reminder','Phone','Move-in Date','Bed ID','Bed Label','Room ID'],
    Properties: ['Property ID','Property Name','Address','City','Total Floors','Status','Created At'],
    Rooms: ['Room ID','Property ID','Floor','Room No','Room Type','Monthly Rent','Status','Created At'],
    Beds: ['Bed ID','Property ID','Room ID','Room No','Bed Label','Status','Student ID','Updated At'],
    Settings: ['PG name','Reminder date','Owner email'],
    'Automation Logs': ['Timestamp','Student ID','Name','Email','Action','Status','Reminder','Type','Details']
  },
  REMINDER_DAYS: [0, 3],
  TIMEZONE: Session.getScriptTimeZone() || 'Asia/Kolkata'
};

// Sheet headers are deliberately kept exactly as supplied. These aliases let the
// API continue using stable camelCase fields without adding hidden sheet columns.
const PGFLOW_FIELDS = {
  Students: {
    'Student ID':'studentId','Name':'fullName','Email':'email','Room No':'roomNumber',
    'Monthly Rent':'monthlyRent','Due Date':'dueDate','Payment Status':'paymentStatus',
    'Reminder Status':'reminderStatus','Last Reminder':'lastReminder','Phone':'phone',
    'Move-in Date':'moveInDate','Bed ID':'bedId','Bed Label':'bedName','Room ID':'roomId'
  },
  Properties: {
    'Property ID':'propertyId','Property Name':'name','Address':'address','City':'city',
    'Total Floors':'floorCount','Status':'status','Created At':'createdAt'
  },
  Rooms: {
    'Room ID':'roomId','Property ID':'propertyId','Floor':'floor','Room No':'roomNumber',
    'Room Type':'roomType','Monthly Rent':'rent','Status':'status','Created At':'createdAt'
  },
  Beds: {
    'Bed ID':'bedId','Property ID':'propertyId','Room ID':'roomId','Room No':'roomNumber',
    'Bed Label':'bedNumber','Status':'status','Student ID':'studentId','Updated At':'updatedAt'
  },
  Settings: {'PG name':'pgName','Reminder date':'reminderDate','Owner email':'ownerEmail'},
  'Automation Logs': {
    'Timestamp':'timestamp','Student ID':'studentId','Name':'name','Email':'email',
    'Action':'action','Status':'status','Reminder':'reminderKey','Type':'type','Details':'details'
  }
};

function doGet(e) { return dispatch_(e, false); }
function doPost(e) { return dispatch_(e, true); }
function dispatch_(e, isPost) {
  try {
    const params = (e && e.parameter) || {};
    const action = String(params.action || 'health');
    const payload = parsePayload_(params);
    const result = route_(action, payload);
    return json_({ success: true, data: result });
  } catch (err) {
    logErrorSafely_(err);
    return json_({ success: false, error: err && err.message ? err.message : String(err) });
  }
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function parsePayload_(p) {
  const out = Object.assign({}, p);
  ['student','property','room','bed','settings'].forEach(k => { if (typeof out[k] === 'string') { try { out[k] = JSON.parse(out[k]); } catch (_) { throw new Error('Invalid JSON in form field: ' + k); } } });
  return out;
}
function route_(action, p) {
  switch (action) {
    case 'health': return { message: 'PGFlow API ready', version: PGFLOW.VERSION, timestamp: new Date().toISOString() };
    case 'setupSheets': return setupSheets();
    case 'dashboard': return dashboard_();
    case 'getStudents': return getStudents_(p);
    case 'addStudent': return addStudent_(requiredObject_(p.student || p, 'student'));
    case 'updateStudent': return updateStudent_(requiredObject_(p.student || p, 'student'));
    case 'deleteStudent': return deleteStudent_(p.studentId);
    case 'markPaid': return markPaid_(p.studentId);
    case 'getProperties': return getProperties_();
    case 'addProperty': return addProperty_(requiredObject_(p.property || p, 'property'));
    case 'updateProperty': return updateProperty_(requiredObject_(p.property || p, 'property'));
    case 'deleteProperty': return deleteProperty_(p.propertyId);
    case 'getRooms': return getRooms_(p.propertyId);
    case 'addRoom': return addRoom_(requiredObject_(p.room || p, 'room'));
    case 'updateRoom': return updateRoom_(requiredObject_(p.room || p, 'room'));
    case 'deleteRoom': return deleteRoom_(p.roomId);
    case 'getBeds': return getBeds_(p.propertyId, p.roomId);
    case 'addBed': return addBed_(requiredObject_(p.bed || p, 'bed'));
    case 'updateBed': return updateBed_(requiredObject_(p.bed || p, 'bed'));
    case 'deleteBed': return deleteBed_(p.bedId);
    case 'assignStudentToBed': return assignStudentToBed_(p.studentId, p.bedId);
    case 'changeStudentBed': return assignStudentToBed_(p.studentId, p.bedId);
    case 'vacateBed': return vacateBed_(p.studentId);
    case 'getPropertyDetails': return getPropertyDetails_(p.propertyId);
    case 'getTenantProfile': return getTenantProfile_(p.studentId);
    case 'runAutomation': return runAutomation_();
    case 'getAutomationLogs': return getAutomationLogs_();
    case 'getSettings': return getSettings_();
    case 'updateSettings': return updateSettings_(p.settings || p);
    default: throw new Error('Unknown action: ' + action);
  }
}

/** Run once after setting Script Property SPREADSHEET_ID. Adds only missing sheets/headers. */
function setupSheets() {
  const ss = spreadsheet_(); const result = [];
  Object.keys(PGFLOW.SHEETS).forEach(name => {
    let sh = ss.getSheetByName(name); if (!sh && name === 'Settings') sh = ss.getSheetByName('Setting'); if (!sh) sh = ss.insertSheet(name);
    const expected = PGFLOW.SHEETS[name];
    if (sh.getLastRow() === 0) { sh.getRange(1, 1, 1, expected.length).setValues([expected]); sh.setFrozenRows(1); result.push(name + ': created headers'); return; }
    const existing = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getDisplayValues()[0].map(v => String(v).trim());
    const missing = expected.filter(h => existing.indexOf(h) === -1);
    if (missing.length) throw new Error('Sheet "' + name + '" has incompatible headers. Missing: ' + missing.join(', ') + '. No data was changed. Back up and migrate/reorder the sheet headers before running setup again.');
    result.push(name + ': verified');
  });
  return { message: 'Sheets verified. Existing data was not cleared.', sheets: result };
}
function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('Missing Script Property SPREADSHEET_ID. Set it to the Google Sheets spreadsheet ID.');
}
function sheet_(name) { const ss=spreadsheet_(); let sh=ss.getSheetByName(name); if(!sh && name==='Settings') sh=ss.getSheetByName('Setting'); if (!sh) throw new Error('Missing sheet "' + name + '". Run setupSheets() first.'); return sh; }
function rows_(name) {
  const sh = sheet_(name); const values = sh.getDataRange().getValues();
  if (!values.length) throw new Error('Sheet "' + name + '" has no header row.');
  const headers = values[0].map(v => String(v).trim());
  const expected = PGFLOW.SHEETS[name];
  const missing = expected.filter(h => headers.indexOf(h) < 0);
  if (missing.length) throw new Error('Invalid headers in "' + name + '": missing ' + missing.join(', '));
  const fields = PGFLOW_FIELDS[name] || {};
  return values.slice(1).map((row, i) => {
    const o = { _row: i + 2 };
    headers.forEach((h, j) => { const key = fields[h]; if (key) o[key] = normalizeCell_(row[j]); });
    if (name === 'Students') {
      o.active = true;
      o.notes = '';
      o.floor = '';
      o.propertyId = '';
      o.createdAt = '';
      o.updatedAt = '';
      o.paidAt = '';
      o.fullName = String(o.fullName || '');
      o.monthlyRent = Number(o.monthlyRent) || 0;
      o.paymentStatus = String(o.paymentStatus || 'PENDING').toUpperCase();
    } else if (name === 'Properties') {
      o.active = String(o.status || 'ACTIVE').toUpperCase() !== 'INACTIVE';
      o.ownerName = ''; o.phone = ''; o.email = ''; o.notes = '';
      o.floorCount = Number(o.floorCount) || 0;
    } else if (name === 'Rooms') {
      o.active = String(o.status || 'ACTIVE').toUpperCase() !== 'INACTIVE';
      o.capacity = capacityFromType_(o.roomType);
      o.rent = Number(o.rent) || 0;
      o.updatedAt = '';
    } else if (name === 'Beds') {
      o.active = true;
      o.monthlyRent = 0;
      o.createdAt = '';
    } else if (name === 'Automation Logs') {
      o.logId = 'LOG-' + (i + 2);
      o.message = String(o.details || '');
    }
    return o;
  }).filter(o => Object.keys(o).some(k => k !== '_row' && o[k] !== '' && o[k] !== null));
}
function capacityFromType_(roomType) {
  const text = String(roomType || '').toLowerCase();
  const match = text.match(/(\d+)/);
  if (match) return Math.max(1, Number(match[1]));
  if (text.indexOf('single') >= 0) return 1;
  if (text.indexOf('double') >= 0) return 2;
  if (text.indexOf('triple') >= 0) return 3;
  if (text.indexOf('four') >= 0 || text.indexOf('quad') >= 0) return 4;
  return 1;
}
function normalizeCell_(v) { if (v instanceof Date) return Utilities.formatDate(v, PGFLOW.TIMEZONE, 'yyyy-MM-dd'); return v === null || v === undefined ? '' : v; }
function headerMap_(name) { const sh = sheet_(name); const h = sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0]; const map = {}; h.forEach((v,i)=>map[String(v).trim()]=i+1); return map; }
function writeRecord_(name, rowNumber, obj, isNew) {
  const sh = sheet_(name);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0].map(v => String(v).trim());
  const fieldMap = PGFLOW_FIELDS[name] || {};
  const reverse = {};
  Object.keys(fieldMap).forEach(header => { reverse[fieldMap[header]] = header; });
  const current = isNew ? {} : sh.getRange(rowNumber,1,1,headers.length).getValues()[0].reduce((o,v,i) => {
    const key = fieldMap[headers[i]]; if (key) o[key] = v; return o;
  }, {});
  Object.keys(obj || {}).forEach(key => {
    const header = reverse[key];
    if (header && headers.indexOf(header) >= 0) current[key] = obj[key];
  });
  const values = headers.map(header => {
    const key = fieldMap[header];
    return key && current[key] !== undefined ? current[key] : (isNew ? '' : sh.getRange(rowNumber, headers.indexOf(header)+1).getValue());
  });
  if (isNew) sh.appendRow(values); else sh.getRange(rowNumber,1,1,headers.length).setValues([values]);
  const idKey = idField_(name);
  if (!idKey) return obj;
  const id = obj[idKey] || current[idKey];
  return recordById_(name, idKey, id);
}
function deleteRecordRow_(name, rowNumber) {
  sheet_(name).deleteRow(rowNumber);
  return { deleted: true };
}
function idField_(name) { return {Students:'studentId',Properties:'propertyId',Rooms:'roomId',Beds:'bedId'}[name]; }
function recordById_(name, field, id) { const r = rows_(name).find(x => String(x[field]) === String(id)); if (!r) throw new Error('Write verification failed: ' + field + ' ' + id + ' was not found after save.'); delete r._row; return r; }
function find_(name, field, id, includeInactive) { if (!id) throw new Error(field + ' is required.'); const r = rows_(name).find(x => String(x[field]) === String(id) && (includeInactive || x.active !== false && truthy_(x.active))); if (!r) throw new Error('No active ' + name.toLowerCase() + ' record found for ' + field + ' ' + id + '.'); return r; }
function truthy_(v) { return v === true || String(v).toLowerCase() === 'true' || String(v) === '1' || String(v).toUpperCase() === 'ACTIVE'; }
function activeRows_(name) { return rows_(name).filter(r => r.active !== false && (r.active === true || truthy_(r.active))); }
function requiredObject_(v, name) { if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Form field "' + name + '" must contain a JSON object.'); return v; }
function required_(v, label) { const s = String(v === undefined || v === null ? '' : v).trim(); if (!s) throw new Error(label + ' is required.'); return s; }
function makeId_(prefix) { return prefix + '-' + Utilities.getUuid().replace(/-/g,'').slice(0,12).toUpperCase(); }
function lockRun_(fn) { const lock = LockService.getScriptLock(); if (!lock.tryLock(15000)) throw new Error('Another update is in progress. Please retry in a moment.'); try { return fn(); } finally { lock.releaseLock(); } }
function asNumber_(v, label, allowZero) { const n = Number(v); if (!isFinite(n) || n < 0 || (!allowZero && n === 0)) throw new Error(label + ' must be a valid ' + (allowZero ? 'non-negative' : 'positive') + ' number.'); return n; }
function dateString_(v, label, optional) { if (!v && optional) return ''; const s = required_(v,label); if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(new Date(s + 'T00:00:00').getTime())) throw new Error(label + ' must use YYYY-MM-DD.'); return s; }
function dateCompare_(a,b) { const x = new Date(String(a).slice(0,10)+'T00:00:00Z').getTime(); const y = new Date(String(b).slice(0,10)+'T00:00:00Z').getTime(); return x===y?0:(x<y?-1:1); }
function today_() { return Utilities.formatDate(new Date(), PGFLOW.TIMEZONE, 'yyyy-MM-dd'); }
function paymentStatus_(student) { if (String(student.paymentStatus).toUpperCase()==='PAID') return 'PAID'; if (!student.dueDate) return 'PENDING'; const cmp=dateCompare_(student.dueDate,today_()); return cmp<0?'OVERDUE':cmp===0?'DUE TODAY':'UPCOMING'; }
function enrichStudent_(s) {
  const out = Object.assign({}, s); delete out._row;
  out.monthlyRent = Number(out.monthlyRent) || 0;
  out.active = true;
  const rooms = rows_('Rooms'); const beds = rows_('Beds'); const properties = rows_('Properties');
  const room = rooms.find(r => String(r.roomId) === String(out.roomId));
  const bed = beds.find(b => String(b.bedId) === String(out.bedId));
  if (!out.propertyId) out.propertyId = bed ? bed.propertyId : room ? room.propertyId : '';
  if (!out.floor) out.floor = room ? room.floor : '';
  out.roomName = room ? room.roomNumber : String(out.roomNumber || '');
  out.bedName = bed ? bed.bedNumber : String(out.bedName || '');
  const property = properties.find(p => String(p.propertyId) === String(out.propertyId));
  out.propertyName = property ? property.name : '';
  out.paymentStatus = paymentStatus_(out);
  out.notes = '';
  return out;
}
function getStudents_(p) { let list=activeRows_('Students').map(enrichStudent_); if(p.propertyId) list=list.filter(s=>String(s.propertyId)===String(p.propertyId)); if(p.roomId) list=list.filter(s=>String(s.roomId)===String(p.roomId)); if(p.status && String(p.status).toUpperCase()!=='ALL') list=list.filter(s=>s.paymentStatus===String(p.status).toUpperCase()); if(p.search) { const q=String(p.search).toLowerCase(); list=list.filter(s=>[s.studentId,s.fullName,s.email,s.phone,s.roomId,s.roomName].join(' ').toLowerCase().indexOf(q)>=0); } return list.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))); }
function addStudent_(input) {
  return lockRun_(function () {
    const name = required_(input.fullName || input.name || input.Name, 'Full name');
    const id = makeId_('STU');
    const rent = asNumber_(input.monthlyRent, 'Monthly rent', true);
    const due = dateString_(input.dueDate, 'Due date', false);
    const move = dateString_(input.moveInDate, 'Move-in date', true);
    const email = String(input.email || input.Email || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email address is invalid.');

    const selectedBed = input.bedId ? find_('Beds', 'bedId', input.bedId) : null;
    const roomId = String(input.roomId || (selectedBed && selectedBed.roomId) || '');
    const selectedRoom = roomId ? find_('Rooms', 'roomId', roomId) : null;
    const propertyId = String(input.propertyId || (selectedRoom && selectedRoom.propertyId) || (selectedBed && selectedBed.propertyId) || '');
    if (propertyId) find_('Properties', 'propertyId', propertyId);
    if (selectedRoom && propertyId && String(selectedRoom.propertyId) !== propertyId) throw new Error('Room does not belong to selected property.');
    if (selectedBed) {
      if (String(selectedBed.status).toUpperCase() === 'OCCUPIED') throw new Error('Selected bed is already occupied.');
      if (String(selectedBed.roomId) !== roomId || String(selectedBed.propertyId) !== propertyId) throw new Error('Selected bed does not match the selected property and room.');
    }

    const status = String(input.paymentStatus || 'PENDING').toUpperCase();
    if (!['PAID', 'PENDING', 'UPCOMING', 'DUE TODAY', 'OVERDUE'].includes(status)) throw new Error('Invalid payment status.');
    const row = {
      studentId: id, fullName: name, email: email,
      phone: String(input.phone || '').trim(), propertyId: propertyId,
      floor: selectedRoom ? String(selectedRoom.floor) : '',
      roomId: roomId, roomNumber: selectedRoom ? String(selectedRoom.roomNumber) : '',
      bedId: '', bedName: '', monthlyRent: rent, dueDate: due,
      paymentStatus: status, moveInDate: move, reminderStatus: 'PENDING', lastReminder: ''
    };
    writeRecord_('Students', 0, row, true);

    if (selectedBed) {
      writeRecord_('Beds', selectedBed._row, {status: 'OCCUPIED', studentId: id, updatedAt: new Date()}, false);
      const studentRow = rows_('Students').find(x => String(x.studentId) === id);
      writeRecord_('Students', studentRow._row, {bedId: String(selectedBed.bedId), bedName: String(selectedBed.bedNumber)}, false);
    }
    return enrichStudent_(recordById_('Students', 'studentId', id));
  });
}

function updateStudent_(input) {
  return lockRun_(function () {
    const id = required_(input.studentId || input['Student ID'], 'Student ID');
    const old = find_('Students', 'studentId', id);
    const update = {};
    ['fullName', 'email', 'phone', 'roomNumber'].forEach(k => {
      if (input[k] !== undefined) update[k] = String(input[k]).trim();
    });
    if (input.monthlyRent !== undefined) update.monthlyRent = asNumber_(input.monthlyRent, 'Monthly rent', true);
    if (input.dueDate !== undefined) update.dueDate = dateString_(input.dueDate, 'Due date', false);
    if (input.moveInDate !== undefined) update.moveInDate = dateString_(input.moveInDate, 'Move-in date', true);
    if (input.paymentStatus !== undefined) {
      const status = String(input.paymentStatus).toUpperCase();
      if (!['PAID', 'PENDING', 'UPCOMING', 'DUE TODAY', 'OVERDUE'].includes(status)) throw new Error('Invalid payment status.');
      update.paymentStatus = status;
    }
    if (update.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) throw new Error('Email address is invalid.');

    const requestedRoomId = input.roomId !== undefined ? String(input.roomId || '') : String(old.roomId || '');
    const requestedBedId = input.bedId !== undefined ? String(input.bedId || '') : String(old.bedId || '');
    let room = requestedRoomId ? find_('Rooms', 'roomId', requestedRoomId) : null;
    let bed = requestedBedId ? find_('Beds', 'bedId', requestedBedId) : null;

    if (bed) {
      if (room && String(bed.roomId) !== String(room.roomId)) throw new Error('Selected bed does not belong to the selected room.');
      room = find_('Rooms', 'roomId', bed.roomId);
      if (String(bed.status).toUpperCase() === 'OCCUPIED' && String(bed.studentId) !== String(id)) throw new Error('Selected bed is already occupied.');
    }
    if (room) {
      update.roomId = String(room.roomId);
      update.roomNumber = String(room.roomNumber);
    } else if (input.roomId !== undefined && !requestedRoomId) {
      update.roomId = ''; update.roomNumber = '';
    }

    if (input.bedId !== undefined && requestedBedId !== String(old.bedId || '')) {
      if (old.bedId) releaseBed_(old.bedId, id);
      if (bed) {
        writeRecord_('Beds', bed._row, {status: 'OCCUPIED', studentId: String(id), updatedAt: new Date()}, false);
        update.bedId = String(bed.bedId);
        update.bedName = String(bed.bedNumber);
      } else {
        update.bedId = ''; update.bedName = '';
      }
    }

    const saved = writeRecord_('Students', old._row, update, false);
    return enrichStudent_(saved);
  });
}
function deleteStudent_(studentId) { return lockRun_(function(){ const s=find_('Students','studentId',studentId); if(s.bedId) releaseBed_(s.bedId,s.studentId); deleteRecordRow_('Students',s._row); return {studentId:String(studentId),deleted:true}; }); }
function markPaid_(studentId) { return lockRun_(function(){ const s=find_('Students','studentId',studentId); if(String(s.paymentStatus).toUpperCase()==='PAID') return enrichStudent_(s); const saved=writeRecord_('Students',s._row,{paymentStatus:'PAID',paidAt:new Date(),updatedAt:new Date()},false); log_('MARK_PAID','SUCCESS','Payment status marked PAID for '+s.fullName,s.studentId,''); return enrichStudent_(saved); }); }
function getProperties_() { const props=activeRows_('Properties'); const rooms=activeRows_('Rooms'); const beds=activeRows_('Beds'); return props.map(p=>{const rs=rooms.filter(r=>String(r.propertyId)===String(p.propertyId));const bs=beds.filter(b=>String(b.propertyId)===String(p.propertyId));const out=Object.assign({},p);delete out._row;out.floorCount=Number(out.floorCount)||[...new Set(rs.map(r=>String(r.floor)))].length||1;out.roomCount=rs.length;out.bedCount=bs.length;out.occupiedBeds=bs.filter(b=>String(b.status).toUpperCase()==='OCCUPIED').length;out.vacantBeds=bs.filter(b=>String(b.status).toUpperCase()==='VACANT').length;out.active=truthy_(out.active);return out;}); }
function addProperty_(p) {
  return lockRun_(function(){
    const name=required_(p.name || p.propertyName || p['Property Name'],'Property name');
    const id=makeId_('PRP'); const now=new Date();
    const row={propertyId:id,name:name,address:String(p.address||''),city:String(p.city||''),floorCount:asNumber_(p.floorCount===undefined?p.totalFloors||1:p.floorCount,'Total floors',false),status:String(p.status||'ACTIVE').toUpperCase(),createdAt:now};
    if(!['ACTIVE','INACTIVE'].includes(row.status)) row.status='ACTIVE';
    writeRecord_('Properties',0,row,true);
    return getProperties_().find(x=>x.propertyId===id);
  });
}
function updateProperty_(p) {
  return lockRun_(function(){
    const id=p.propertyId||p['Property ID']; const old=find_('Properties','propertyId',id); const up={};
    ['name','address','city'].forEach(k=>{if(p[k]!==undefined)up[k]=String(p[k]);});
    if(p.floorCount!==undefined || p.totalFloors!==undefined) up.floorCount=asNumber_(p.floorCount===undefined?p.totalFloors:p.floorCount,'Total floors',false);
    if(p.status!==undefined) up.status=String(p.status).toUpperCase();
    else if(p.active!==undefined) up.status=p.active?'ACTIVE':'INACTIVE';
    if(up.name!==undefined) required_(up.name,'Property name');
    writeRecord_('Properties',old._row,up,false);
    return getProperties_().find(x=>x.propertyId===String(id));
  });
}
function deleteProperty_(id) {
  return lockRun_(function(){
    const p=find_('Properties','propertyId',id);
    const rooms=activeRows_('Rooms').filter(r=>String(r.propertyId)===String(id));
    const beds=activeRows_('Beds').filter(b=>String(b.propertyId)===String(id));
    const students=activeRows_('Students').filter(s=>String(s.propertyId)===String(id)||beds.some(b=>String(b.bedId)===String(s.bedId)));
    if(rooms.length||beds.length||students.length) throw new Error('Cannot deactivate this property while it has rooms, beds, or student assignments. Remove/reassign dependent records first.');
    writeRecord_('Properties',p._row,{status:'INACTIVE'},false);
    return {propertyId:String(id),deactivated:true};
  });
}
function getRooms_(propertyId) {
  let list=activeRows_('Rooms'); if(propertyId) list=list.filter(r=>String(r.propertyId)===String(propertyId));
  return list.map(r=>{delete r._row;r.capacity=capacityFromType_(r.roomType);r.rent=Number(r.rent)||0;r.active=true;return r;});
}
function addRoom_(r) {
  return lockRun_(function(){
    const prop=find_('Properties','propertyId',r.propertyId);
    const roomNumber=required_(r.roomNumber,'Room number');
    if(activeRows_('Rooms').some(x=>String(x.propertyId)===String(prop.propertyId)&&String(x.roomNumber).toLowerCase()===roomNumber.toLowerCase())) throw new Error('That room number already exists in this property.');
    const roomType=required_(r.roomType || (r.capacity ? String(r.capacity)+' Sharing' : ''),'Room type');
    const row={roomId:makeId_('ROM'),propertyId:String(prop.propertyId),floor:required_(r.floor,'Floor'),roomNumber:roomNumber,roomType:roomType,rent:asNumber_(r.rent===undefined?r.monthlyRent||0:r.rent,'Monthly rent',true),status:String(r.status||'ACTIVE').toUpperCase(),createdAt:new Date()};
    writeRecord_('Rooms',0,row,true);
    return rows_('Rooms').find(x=>x.roomId===row.roomId);
  });
}
function updateRoom_(r) {
  return lockRun_(function(){
    const old=find_('Rooms','roomId',r.roomId); const up={};
    ['floor','roomNumber','roomType'].forEach(k=>{if(r[k]!==undefined)up[k]=required_(r[k],k);});
    if(r.capacity!==undefined && r.roomType===undefined) up.roomType=String(asNumber_(r.capacity,'Capacity',false))+' Sharing';
    if(r.rent!==undefined || r.monthlyRent!==undefined) up.rent=asNumber_(r.rent===undefined?r.monthlyRent:r.rent,'Monthly rent',true);
    if(r.status!==undefined) up.status=String(r.status).toUpperCase();
    if(r.propertyId!==undefined){find_('Properties','propertyId',r.propertyId);if(activeRows_('Beds').some(b=>String(b.roomId)===String(old.roomId)))throw new Error('Cannot move a room to another property while beds exist.');up.propertyId=String(r.propertyId);}
    writeRecord_('Rooms',old._row,up,false);
    return rows_('Rooms').find(x=>x.roomId===String(r.roomId));
  });
}
function deleteRoom_(id) {
  return lockRun_(function(){const r=find_('Rooms','roomId',id);if(activeRows_('Beds').some(b=>String(b.roomId)===String(id)))throw new Error('Cannot delete this room while beds exist. Delete/reassign its beds first.');if(activeRows_('Students').some(s=>String(s.roomId)===String(id)))throw new Error('Cannot delete this room while students reference it.');writeRecord_('Rooms',r._row,{status:'INACTIVE'},false);return {roomId:String(id),deactivated:true};});
}
function getBeds_(propertyId,roomId) {
  let list=activeRows_('Beds'); if(propertyId) list=list.filter(b=>String(b.propertyId)===String(propertyId)); if(roomId) list=list.filter(b=>String(b.roomId)===String(roomId));
  return list.map(b=>{const room=rows_('Rooms').find(r=>String(r.roomId)===String(b.roomId));delete b._row;b.monthlyRent=room?Number(room.rent)||0:0;b.roomNumber=room?room.roomNumber:String(b.roomNumber||'');b.active=true;return b;});
}
function addBed_(b) {
  return lockRun_(function(){
    const p=find_('Properties','propertyId',b.propertyId); const r=find_('Rooms','roomId',b.roomId);
    if(String(r.propertyId)!==String(p.propertyId)) throw new Error('Room does not belong to selected property.');
    const label=required_(b.bedNumber || b.bedLabel,'Bed label');
    if(activeRows_('Beds').some(x=>String(x.roomId)===String(r.roomId)&&String(x.bedNumber).toLowerCase()===label.toLowerCase())) throw new Error('That bed label already exists in this room.');
    const existing=activeRows_('Beds').filter(x=>String(x.roomId)===String(r.roomId)).length;
    if(existing>=capacityFromType_(r.roomType)) throw new Error('Room capacity reached. Change Room Type before adding another bed.');
    const row={bedId:makeId_('BED'),propertyId:String(p.propertyId),roomId:String(r.roomId),roomNumber:String(r.roomNumber),bedNumber:label,status:'VACANT',studentId:'',updatedAt:new Date()};
    writeRecord_('Beds',0,row,true); return rows_('Beds').find(x=>x.bedId===row.bedId);
  });
}
function updateBed_(b) {
  return lockRun_(function(){const old=find_('Beds','bedId',b.bedId);const up={updatedAt:new Date()};if(b.bedNumber!==undefined || b.bedLabel!==undefined)up.bedNumber=required_(b.bedNumber===undefined?b.bedLabel:b.bedNumber,'Bed label');if(b.roomId!==undefined){const r=find_('Rooms','roomId',b.roomId);if(String(r.propertyId)!==String(old.propertyId))throw new Error('Room does not belong to this bed property.');if(String(old.status)==='OCCUPIED'&&String(b.roomId)!==String(old.roomId))throw new Error('Vacate this bed before moving it to another room.');up.roomId=String(r.roomId);up.roomNumber=String(r.roomNumber);up.propertyId=String(r.propertyId);}if(b.status!==undefined){const status=String(b.status).toUpperCase();if(!['VACANT','OCCUPIED'].includes(status))throw new Error('Bed status must be VACANT or OCCUPIED.');if(status==='VACANT'&&old.studentId)throw new Error('Use vacateBed to clear a student assignment safely.');if(status==='OCCUPIED'&&!old.studentId)throw new Error('Use assignStudentToBed to occupy a bed.');up.status=status;}writeRecord_('Beds',old._row,up,false);return rows_('Beds').find(x=>x.bedId===String(b.bedId));});
}
function deleteBed_(id) {
  return lockRun_(function(){const b=find_('Beds','bedId',id);if(String(b.status).toUpperCase()==='OCCUPIED'||b.studentId)throw new Error('Cannot delete an occupied bed. Vacate it first.');if(activeRows_('Students').some(s=>String(s.bedId)===String(id)))throw new Error('A student still references this bed. Clear the assignment first.');deleteRecordRow_('Beds',b._row);return {bedId:String(id),deleted:true};});
}
function assignStudentToBed_(studentId,bedId) { return lockRun_(function(){const s=find_('Students','studentId',studentId);const b=find_('Beds','bedId',bedId);if(String(b.status).toUpperCase()==='OCCUPIED'&&String(b.studentId)!==String(s.studentId))throw new Error('Bed is already occupied by another student.');const room=find_('Rooms','roomId',b.roomId);if(String(room.propertyId)!==String(b.propertyId))throw new Error('Bed/room property relationship is invalid.');if(s.bedId&&String(s.bedId)!==String(b.bedId))releaseBed_(s.bedId,s.studentId);writeRecord_('Beds',b._row,{status:'OCCUPIED',studentId:String(s.studentId),updatedAt:new Date()},false);writeRecord_('Students',s._row,{propertyId:String(b.propertyId),floor:String(room.floor),roomId:String(b.roomId),roomNumber:String(room.roomNumber),bedId:String(b.bedId),bedName:String(b.bedNumber),updatedAt:new Date()},false);return enrichStudent_(recordById_('Students','studentId',s.studentId));}); }
function releaseBed_(bedId,studentId) { const b=rows_('Beds').find(x=>String(x.bedId)===String(bedId));if(!b)return;if(b.studentId&&studentId&&String(b.studentId)!==String(studentId))throw new Error('Bed is assigned to a different student; refusing to release it.');writeRecord_('Beds',b._row,{status:'VACANT',studentId:'',updatedAt:new Date()},false); }
function vacateBed_(studentId) { return lockRun_(function(){const s=find_('Students','studentId',studentId);if(s.bedId)releaseBed_(s.bedId,s.studentId);const saved=writeRecord_('Students',s._row,{bedId:'',bedName:'',roomId:'',roomNumber:'',floor:'',propertyId:'',updatedAt:new Date()},false);return enrichStudent_(saved);}); }
function getPropertyDetails_(propertyId) { const p=getProperties_().find(x=>String(x.propertyId)===String(propertyId));if(!p)throw new Error('Property not found: '+propertyId);const rooms=getRooms_(propertyId);const beds=getBeds_(propertyId);const students=activeRows_('Students').map(enrichStudent_).filter(s=>String(s.propertyId)===String(propertyId));return {property:p,rooms:rooms,beds:beds,students:students}; }
function getTenantProfile_(studentId) { return enrichStudent_(find_('Students','studentId',studentId)); }
function dashboard_() { const students=activeRows_('Students').map(enrichStudent_);const properties=getProperties_();const rooms=activeRows_('Rooms');const beds=activeRows_('Beds');const paid=students.filter(s=>s.paymentStatus==='PAID');const due=students.filter(s=>s.paymentStatus==='DUE TODAY');const overdue=students.filter(s=>s.paymentStatus==='OVERDUE');const unpaid=students.filter(s=>s.paymentStatus!=='PAID');const monthly=students.reduce((n,s)=>n+(Number(s.monthlyRent)||0),0);const collected=paid.reduce((n,s)=>n+(Number(s.monthlyRent)||0),0);const logs=getAutomationLogs_();return {totalStudents:students.length,totalPaid:paid.length,pendingPayments:unpaid.length,dueToday:due.length,overduePayments:overdue.length,totalProperties:properties.length,totalRooms:rooms.length,totalBeds:beds.length,occupiedBeds:beds.filter(b=>String(b.status).toUpperCase()==='OCCUPIED').length,vacantBeds:beds.filter(b=>String(b.status).toUpperCase()==='VACANT').length,monthlyRent:monthly,collectedRent:collected,outstandingRent:unpaid.reduce((n,s)=>n+(Number(s.monthlyRent)||0),0),recentStudents:students.slice(0,8),upcomingPayments:unpaid.sort((a,b)=>dateCompare_(a.dueDate||'9999-12-31',b.dueDate||'9999-12-31')).slice(0,10),occupancy:properties,recentActivity:logs.slice(0,6)}; }
function log_(action,status,message,studentId,reminderKey,studentName,studentEmail,type) {
  const sh=sheet_('Automation Logs');
  const row={timestamp:new Date(),studentId:studentId||'',name:studentName||'',email:studentEmail||'',action:action||'',status:status||'',reminderKey:reminderKey||'',type:type||action||'',details:message||''};
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0].map(v=>String(v).trim());
  const fields=PGFLOW_FIELDS['Automation Logs'];
  sh.appendRow(headers.map(h=>{const key=fields[h];return key&&row[key]!==undefined?row[key]:'';}));
  return row;
}
function getAutomationLogs_() {
  return rows_('Automation Logs').sort((a,b)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime()).slice(0,100).map(r=>{
    const out={logId:r.logId,timestamp:r.timestamp instanceof Date?r.timestamp.toISOString():String(r.timestamp||''),action:String(r.action||''),status:String(r.status||''),message:String(r.details||''),details:String(r.details||''),studentId:String(r.studentId||''),name:String(r.name||''),email:String(r.email||''),reminder:String(r.reminderKey||''),type:String(r.type||'')};
    return out;
  });
}
function getSettings_() {
  const rows=rows_('Settings');
  if(!rows.length) return {pgName:'PGFlow',reminderDate:'',ownerEmail:''};
  const row=rows[0]; return {pgName:String(row.pgName||'PGFlow'),reminderDate:String(row.reminderDate||''),ownerEmail:String(row.ownerEmail||'')};
}
function updateSettings_(input) {
  const sh=sheet_('Settings'); const headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0].map(v=>String(v).trim());
  const fields=PGFLOW_FIELDS.Settings; const old=sh.getLastRow()>1?sh.getRange(2,1,1,headers.length).getValues()[0]:[];
  const current={}; headers.forEach((h,i)=>{if(fields[h])current[fields[h]]=old[i]===undefined?'':old[i];});
  ['pgName','reminderDate','ownerEmail'].forEach(k=>{if(input[k]!==undefined)current[k]=String(input[k]).trim();});
  if(current.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.ownerEmail)) throw new Error('Owner email is invalid.');
  const row=headers.map(h=>{const k=fields[h];return k&&current[k]!==undefined?current[k]:'';});
  if(sh.getLastRow()>1) sh.getRange(2,1,1,headers.length).setValues([row]); else sh.appendRow(row);
  return getSettings_();
}
function runAutomation_() {
  const results={sent:0,skipped:0,failed:0}; const students=activeRows_('Students'); const today=today_(); const settings=getSettings_();
  students.forEach(s=>{try{
    if(String(s.paymentStatus).toUpperCase()==='PAID'){results.skipped++;return;}
    if(!s.email){results.skipped++;log_('RENT_REMINDER','SKIPPED','No email address for '+s.fullName,s.studentId,'',s.fullName,s.email,'RENT_REMINDER');return;}
    const due=dateString_(s.dueDate,'Due date',false); const diff=Math.round((new Date(today+'T00:00:00Z').getTime()-new Date(due+'T00:00:00Z').getTime())/86400000);
    if(PGFLOW.REMINDER_DAYS.indexOf(diff)<0){results.skipped++;return;}
    const key=String(s.studentId)+'|'+today+'|D'+diff; const logs=rows_('Automation Logs');
    if(logs.some(l=>String(l.reminderKey)===key&&String(l.status)==='SUCCESS')){results.skipped++;return;}
    const pgName=settings.pgName||'PGFlow'; const subject=pgName+' rent reminder: '+(diff===0?'due today':'overdue');
    const body='Hello '+s.fullName+',\n\nThis is a reminder from '+pgName+' that your monthly rent of ₹'+(Number(s.monthlyRent)||0)+' is '+(diff===0?'due today ('+due+')':'overdue since '+due)+'. If you have already paid, please ignore this email.\n\nRegards,\n'+pgName;
    const mail={to:String(s.email),subject:subject,body:body}; if(settings.ownerEmail)mail.cc=settings.ownerEmail; MailApp.sendEmail(mail);
    writeRecord_('Students',s._row,{lastReminder:new Date(),reminderStatus:'SENT'},false);
    log_('RENT_REMINDER','SUCCESS','Reminder sent to '+s.email,s.studentId,key,s.fullName,s.email,'RENT_REMINDER'); results.sent++;
  }catch(err){results.failed++;try{log_('RENT_REMINDER','FAILED',String(err&&err.message||err),s.studentId,'',s.fullName,s.email,'RENT_REMINDER');}catch(_){}}});
  log_('RUN_AUTOMATION','SUCCESS','Automation complete. Sent '+results.sent+', skipped '+results.skipped+', failed '+results.failed+'.','','','','SYSTEM'); return results;
}
function setupDailyTrigger() { ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='runAutomation').forEach(t=>ScriptApp.deleteTrigger(t));ScriptApp.newTrigger('runAutomation').timeBased().everyDays(1).atHour(9).create();return 'Daily rent reminder trigger created for approximately 9 AM in the script timezone ('+PGFLOW.TIMEZONE+').'; }
function runAutomation() { return runAutomation_(); }
function logErrorSafely_(err) { try { if (String(err && err.message || err).indexOf('Missing Script Property')===-1) log_('API_ERROR','FAILED',String(err&&err.message||err),'',''); } catch (_) {} }
