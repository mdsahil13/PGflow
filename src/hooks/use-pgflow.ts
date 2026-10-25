import { useMutation, useQuery } from '@tanstack/react-query'; import { api } from '../lib/api'; import { invalidateCore } from '../lib/query-client';
export function useDashboard(){return useQuery({queryKey:['dashboard'],queryFn:api.dashboard});}
export function useStudents(){return useQuery({queryKey:['students'],queryFn:()=>api.getStudents()});}
export function useProperties(){return useQuery({queryKey:['properties'],queryFn:api.getProperties});}
export function useRooms(propertyId?:string){return useQuery({queryKey:['rooms',propertyId],queryFn:()=>api.getRooms(propertyId)});}
export function useBeds(propertyId?:string,roomId?:string){return useQuery({queryKey:['beds',propertyId,roomId],queryFn:()=>api.getBeds(propertyId,roomId)});}
export function usePropertyDetails(propertyId:string){return useQuery({queryKey:['property-details',propertyId],queryFn:()=>api.getPropertyDetails(propertyId),enabled:!!propertyId});}
export function usePgMutation<TVariables,TResult>(mutationFn:(variables:TVariables)=>Promise<TResult>){return useMutation({mutationFn,onSuccess:invalidateCore});}
