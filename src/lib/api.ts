import type { ApiResponse, AppSettings, Bed, DashboardStats, Property, PropertyDetails, Room, Student, AutomationLog } from '../types';
const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL?.trim() ?? '';
export class ApiError extends Error { constructor(message:string){super(message);this.name='ApiError';} }
function endpoint(){ if(!API_URL || API_URL.includes('REPLACE_WITH_DEPLOYMENT_ID')) throw new ApiError('Apps Script URL is not configured. Set VITE_APPS_SCRIPT_URL in .env and restart Vite.'); return API_URL; }
async function request<T>(action:string, params:Record<string,unknown>={}, method:'GET'|'POST'='GET'):Promise<T>{
  const url=endpoint(); const fields={action,...params};
  try {
    let response:Response;
    if(method==='GET') { const query=new URLSearchParams(); Object.entries(fields).forEach(([k,v])=>{if(v!==undefined&&v!==null)query.set(k,typeof v==='object'?JSON.stringify(v):String(v));}); response=await fetch(`${url}?${query.toString()}`,{method:'GET',redirect:'follow'}); }
    else { const body=new URLSearchParams(); Object.entries(fields).forEach(([k,v])=>{if(v!==undefined&&v!==null)body.set(k,typeof v==='object'?JSON.stringify(v):String(v));}); response=await fetch(url,{method:'POST',body,redirect:'follow'}); }
    if(!response.ok) throw new ApiError(`Backend returned HTTP ${response.status}.`);
    const raw=await response.text(); let parsed:ApiResponse<T>; try{parsed=JSON.parse(raw) as ApiResponse<T>;}catch{throw new ApiError('Backend response was not JSON. Check Web App deployment, permissions, and browser CORS/redirect behavior.');}
    if(!parsed || typeof parsed.success!=='boolean') throw new ApiError('Backend response did not match the { success, data, error } contract.');
    if(!parsed.success) throw new ApiError(parsed.error||`Backend action ${action} failed.`);
    return parsed.data as T;
  } catch(e){ if(e instanceof ApiError)throw e; throw new ApiError(`Could not reach Apps Script (${e instanceof Error?e.message:'network error'}). If the URL is correct, configure a same-origin proxy for CORS/redirect restrictions.`); }
}
const get=<T,>(action:string,params:Record<string,unknown>={})=>request<T>(action,params,'GET');
const post=<T,>(action:string,params:Record<string,unknown>={})=>request<T>(action,params,'POST');
export const api={
 health:()=>get<{message:string}>('health'), dashboard:()=>get<DashboardStats>('dashboard'),
 getStudents:(filters:Record<string,unknown>={})=>get<Student[]>('getStudents',filters), addStudent:(student:Partial<Student>)=>post<Student>('addStudent',{student}), updateStudent:(student:Partial<Student>&{studentId:string})=>post<Student>('updateStudent',{student}), deleteStudent:(studentId:string)=>post<boolean>('deleteStudent',{studentId}), markPaid:(studentId:string)=>post<Student>('markPaid',{studentId}),
 getProperties:()=>get<Property[]>('getProperties'), addProperty:(property:Partial<Property>)=>post<Property>('addProperty',{property}), updateProperty:(property:Partial<Property>&{propertyId:string})=>post<Property>('updateProperty',{property}), deleteProperty:(propertyId:string)=>post<boolean>('deleteProperty',{propertyId}),
 getRooms:(propertyId?:string)=>get<Room[]>('getRooms',propertyId?{propertyId}:{}), addRoom:(room:Partial<Room>)=>post<Room>('addRoom',{room}), updateRoom:(room:Partial<Room>&{roomId:string})=>post<Room>('updateRoom',{room}), deleteRoom:(roomId:string)=>post<boolean>('deleteRoom',{roomId}),
 getBeds:(propertyId?:string,roomId?:string)=>get<Bed[]>('getBeds',{...(propertyId?{propertyId}:{}),...(roomId?{roomId}:{})}), addBed:(bed:Partial<Bed>)=>post<Bed>('addBed',{bed}), updateBed:(bed:Partial<Bed>&{bedId:string})=>post<Bed>('updateBed',{bed}), deleteBed:(bedId:string)=>post<boolean>('deleteBed',{bedId}),
 assignStudentToBed:(studentId:string,bedId:string)=>post<Student>('assignStudentToBed',{studentId,bedId}), changeStudentBed:(studentId:string,bedId:string)=>post<Student>('changeStudentBed',{studentId,bedId}), vacateBed:(studentId:string)=>post<Student>('vacateBed',{studentId}),
 getPropertyDetails:(propertyId:string)=>get<PropertyDetails>('getPropertyDetails',{propertyId}), getTenantProfile:(studentId:string)=>get<Student>('getTenantProfile',{studentId}), runAutomation:()=>post<{sent:number;skipped:number}>('runAutomation'), getAutomationLogs:()=>get<AutomationLog[]>('getAutomationLogs'),
 getSettings:()=>get<AppSettings>('getSettings'),
 updateSettings:(settings:Partial<AppSettings>)=>post<AppSettings>('updateSettings',{settings})
};
