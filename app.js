const KEY='churchRequestFormsSubmissionDataV4';
const defaults={purchases:[],invoices:[],requests:[],events:[],appointments:[],signups:[],signupHeading:{title:'Church Sign Up Sheet',subtitle:'',description:''}};
const data=Object.assign(defaults,JSON.parse(localStorage.getItem(KEY)||'{}'));
data.signupHeading=Object.assign(defaults.signupHeading,data.signupHeading||{});
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};
const money=n=>Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const nextNo=(prefix,arr)=>`${prefix}-${new Date().getFullYear()}-${String(arr.length+1).padStart(3,'0')}`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); document.getElementById(btn.dataset.view).classList.add('active');
});
function setToday(){document.querySelectorAll('input[type=date]').forEach(i=>{if(!i.value)i.value=new Date().toISOString().slice(0,10)})}
setToday();

purchaseForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.purchases.unshift({id:Date.now(),date:f.get('date'),vendor:f.get('vendor'),item:f.get('item'),amount:+f.get('amount'),payment:f.get('payment'),reference:f.get('reference'),notes:f.get('notes')});e.target.reset();setToday();save()};
invoiceForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),qty=+f.get('qty'),price=+f.get('price');data.invoices.unshift({id:Date.now(),number:nextNo('INV',data.invoices),date:f.get('date'),due:f.get('due'),billTo:f.get('billTo'),description:f.get('description'),qty,price,total:qty*price,notes:f.get('notes')});e.target.reset();setToday();save()};
requestForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.requests.unshift({id:Date.now(),number:nextNo('REQ',data.requests),requester:f.get('requester'),department:f.get('department'),date:f.get('date'),amount:+f.get('amount'),description:f.get('description'),reason:f.get('reason'),status:'Pending'});e.target.reset();setToday();save()};
eventForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.events.unshift({id:Date.now(),number:nextNo('EVT',data.events),requester:f.get('requester'),department:f.get('department'),eventName:f.get('eventName'),eventDate:f.get('eventDate'),startTime:f.get('startTime'),endTime:f.get('endTime'),location:f.get('location'),attendance:f.get('attendance'),description:f.get('description'),setup:f.get('setup'),status:'Pending'});e.target.reset();setToday();save()};
appointmentForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.appointments.unshift({id:Date.now(),number:nextNo('APT',data.appointments),requester:f.get('requester'),phone:f.get('phone'),email:f.get('email'),withWhom:f.get('withWhom'),date:f.get('date'),time:f.get('time'),reason:f.get('reason'),notes:f.get('notes'),status:'Pending'});e.target.reset();setToday();save()};
signupHeadingForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.signupHeading={title:f.get('title'),subtitle:f.get('subtitle'),description:f.get('description')};save()};
signupForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.signups.unshift({id:Date.now(),number:nextNo('SIGN',data.signups),name:f.get('name'),phone:f.get('phone'),email:f.get('email'),ministry:f.get('ministry'),activity:f.get('activity'),date:f.get('date'),time:f.get('time'),people:+f.get('people'),notes:f.get('notes')});e.target.reset();setToday();save()};

function updateStatus(type,id,value){const r=data[type].find(x=>x.id===id);if(r){r.status=value;save()}}
function statusSelect(type,r){return `<select onchange="updateStatus('${type}',${r.id},this.value)"><option ${r.status==='Pending'?'selected':''}>Pending</option><option ${r.status==='Approved'?'selected':''}>Approved</option><option ${r.status==='Rejected'?'selected':''}>Rejected</option></select>`}
function printInvoice(id){const inv=data.invoices.find(x=>x.id===id);if(!inv)return;const host=document.createElement('div');host.className='print-host';const node=document.getElementById('invoiceTemplate').content.cloneNode(true);Object.entries(inv).forEach(([k,v])=>node.querySelectorAll(`[data-field="${k}"]`).forEach(el=>el.textContent=(['price','total'].includes(k)?money(v):v||'')));host.appendChild(node);document.body.appendChild(host);window.print();host.remove()}

function render(){
  purchaseCount.textContent=data.purchases.length;invoiceCount.textContent=data.invoices.length;
  pendingCount.textContent=data.requests.filter(r=>r.status==='Pending').length+data.events.filter(r=>r.status==='Pending').length+data.appointments.filter(r=>r.status==='Pending').length;
  eventCount.textContent=data.events.length;appointmentCount.textContent=data.appointments.length;signupCount.textContent=data.signups.length;

  signupTitlePreview.textContent=data.signupHeading.title||'Church Sign Up Sheet';
  signupSubtitlePreview.textContent=data.signupHeading.subtitle||'';
  signupDescriptionPreview.textContent=data.signupHeading.description||'';
  signupHeadingForm.elements.title.value=data.signupHeading.title||'';
  signupHeadingForm.elements.subtitle.value=data.signupHeading.subtitle||'';
  signupHeadingForm.elements.description.value=data.signupHeading.description||'';

  purchaseRows.innerHTML=data.purchases.map(p=>`<tr><td>${p.date}</td><td>${esc(p.vendor)}</td><td>${esc(p.item)}</td><td>$${money(p.amount)}</td><td>${esc(p.reference||'')}</td></tr>`).join('')||'<tr><td colspan="5">No purchases recorded.</td></tr>';
  invoiceRows.innerHTML=data.invoices.map(i=>`<tr><td>${i.number}</td><td>${i.date}</td><td>${esc(i.billTo)}</td><td>$${money(i.total)}</td><td><button class="small-btn" onclick="printInvoice(${i.id})">Print</button></td></tr>`).join('')||'<tr><td colspan="5">No invoices created.</td></tr>';
  requestRows.innerHTML=data.requests.map(r=>`<tr><td>${r.number}</td><td>${r.date}</td><td>${esc(r.requester)}</td><td>${esc(r.department||'')}</td><td>$${money(r.amount)}</td><td>${r.status}</td><td>${statusSelect('requests',r)}</td></tr>`).join('')||'<tr><td colspan="7">No general requests submitted.</td></tr>';
  eventRows.innerHTML=data.events.map(r=>`<tr><td>${r.number}</td><td>${r.eventDate}</td><td>${r.startTime}–${r.endTime}</td><td>${esc(r.eventName)}</td><td>${esc(r.requester)}</td><td>${esc(r.location)}</td><td>${r.status}</td><td>${statusSelect('events',r)}</td></tr>`).join('')||'<tr><td colspan="8">No event requests submitted.</td></tr>';
  appointmentRows.innerHTML=data.appointments.map(r=>`<tr><td>${r.number}</td><td>${r.date}</td><td>${r.time}</td><td>${esc(r.requester)}</td><td>${esc(r.withWhom)}</td><td>${esc(r.phone)}</td><td>${r.status}</td><td>${statusSelect('appointments',r)}</td></tr>`).join('')||'<tr><td colspan="8">No appointment requests submitted.</td></tr>';
  signupRows.innerHTML=data.signups.map(s=>`<tr><td>${s.number}</td><td>${esc(s.name)}</td><td>${esc(s.activity)}</td><td>${s.date}</td><td>${s.time||''}</td><td>${s.people}</td><td>${esc(s.phone)}</td></tr>`).join('')||'<tr><td colspan="7">No sign-ups submitted.</td></tr>';

  const activity=[
    ...data.signups.slice(0,3).map(x=>({t:`Sign Up ${x.number}: ${x.name} — ${x.activity}`,d:x.date})),
    ...data.requests.slice(0,3).map(x=>({t:`Request ${x.number} — ${x.status}`,d:x.date})),
    ...data.events.slice(0,3).map(x=>({t:`Event ${x.number}: ${x.eventName} — ${x.status}`,d:x.eventDate})),
    ...data.appointments.slice(0,3).map(x=>({t:`Appointment ${x.number} with ${x.withWhom} — ${x.status}`,d:x.date}))
  ].sort((a,b)=>String(b.d).localeCompare(String(a.d))).slice(0,8);
  recentActivity.innerHTML=activity.length?activity.map(a=>`<p><strong>${esc(a.t)}</strong><br><small>${a.d}</small></p>`).join(''):'No activity yet.';
}
exportBtn.onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='church-request-data.json';a.click();URL.revokeObjectURL(a.href)};
render();
