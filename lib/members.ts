import type { Member } from './types';
export const cohorts = Array.from({length:32},(_,i)=>i+1);
export function filterMembers(members: Member[], query: string, cohort?: number) {
  const q = query.trim().toLowerCase();
  return members.filter((m)=> (!cohort || m.cohort===cohort) && (!q || [m.name,m.company_name,String(m.cohort),m.industry,m.business_type].some((v)=>v?.toLowerCase().includes(q))));
}
