const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];
const SUPABASE_URL = 'https://hcdfynchmoghttjoqxfm.supabase.co';
const SUPABASE_KEY = ' sb_publishable_gyHjVV8JF9nsw89KNEpukw_my5BwCFq';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const store = {
  get(k, fallback){try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch{return fallback}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
let staff = store.get('waslah_staff', []), parents = store.get('waslah_parents', []), requests = store.get('waslah_requests', []);
const toast=(m)=>{const el=$('#toast');el.textContent=m;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)};

$('#loginForm').addEventListener('submit',e=>{e.preventDefault();if($('#username').value.trim()==='admin'&&$('#password').value==='1234'){sessionStorage.setItem('waslah_logged','1');showApp()}else toast('بيانات الدخول غير صحيحة')});
$('#logoutBtn').onclick=()=>{sessionStorage.removeItem('waslah_logged');location.reload()};
function showApp(){ $('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');renderAll(); }
if(sessionStorage.getItem('waslah_logged')==='1') showApp();

const meta={dashboard:['لوحة التحكم','نظرة سريعة على العمل الإداري'],staff:['بيانات الكادر','إدارة واستيراد بيانات الموظفات'],parents:['أولياء الأمور','إدارة بيانات التواصل'],requests:['الطلبات والمراسلات','متابعة الطلبات والحالات'],platforms:['المنصات','روابط وصول سريعة'],reports:['التقارير','النسخ الاحتياطي والتصدير'],settings:['الإعدادات','معلومات النسخة الحالية']};
function go(page){$$('.page').forEach(x=>x.classList.remove('active-page'));$('#'+page).classList.add('active-page');$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#pageTitle').textContent=meta[page][0];$('#pageSubtitle').textContent=meta[page][1];$('.sidebar').classList.remove('open')}
$$('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.page));$$('.quick').forEach(b=>b.onclick=()=>go(b.dataset.go));$('#menuBtn').onclick=()=>$('.sidebar').classList.toggle('open');

$('#dailyNotes').value=localStorage.getItem('waslah_notes')||'';$('#saveNotes').onclick=()=>{localStorage.setItem('waslah_notes',$('#dailyNotes').value);toast('تم حفظ الملاحظات')};

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function renderAll(){
  $('#staffCount').textContent=staff.length;$('#parentsCount').textContent=parents.length;$('#openRequestsCount').textContent=requests.filter(x=>x.status!=='مكتمل').length;
  $('#staffBody').innerHTML=staff.map((r,i)=>`<tr><td>${esc(r.name)}</td><td>${esc(r.role)}</td><td>${esc(r.phone)}</td><td>${esc(r.email)}</td><td><button class="danger" onclick="delRow('staff',${i})">حذف</button></td></tr>`).join('')||'<tr><td colspan="5" class="muted">لا توجد بيانات بعد</td></tr>';
  $('#parentsBody').innerHTML=parents.map((r,i)=>`<tr><td>${esc(r.parent)}</td><td>${esc(r.student)}</td><td>${esc(r.grade)}</td><td>${esc(r.phone)}</td><td><button class="danger" onclick="delRow('parents',${i})">حذف</button></td></tr>`).join('')||'<tr><td colspan="5" class="muted">لا توجد بيانات بعد</td></tr>';
  $('#requestsBody').innerHTML=requests.map((r,i)=>`<tr><td>${esc(r.title)}</td><td>${esc(r.target)}</td><td>${esc(r.status)}</td><td>${esc(r.date)}</td><td><button class="danger" onclick="delRow('requests',${i})">حذف</button></td></tr>`).join('')||'<tr><td colspan="5" class="muted">لا توجد طلبات بعد</td></tr>';
}
window.delRow=(type,i)=>{if(!confirm('هل أنت متأكد من الحذف؟'))return;if(type==='staff'){staff.splice(i,1);store.set('waslah_staff',staff)}if(type==='parents'){parents.splice(i,1);store.set('waslah_parents',parents)}if(type==='requests'){requests.splice(i,1);store.set('waslah_requests',requests)}renderAll();toast('تم الحذف')};

function openDialog(type){const cfg={staff:{title:'إضافة موظفة',fields:[['name','الاسم'],['role','المسمى الوظيفي'],['phone','الجوال'],['email','البريد الإلكتروني']]},parents:{title:'إضافة ولي أمر',fields:[['parent','اسم ولي الأمر'],['student','اسم الطالبة'],['grade','الصف'],['phone','الجوال']]},requests:{title:'طلب جديد',fields:[['title','عنوان الطلب'],['target','الجهة'],['status','الحالة'],['date','التاريخ']]}}[type];$('#dialogTitle').textContent=cfg.title;$('#dialogFields').innerHTML=cfg.fields.map(([n,l])=>`<label>${l}<input name="${n}" ${n==='date'?'type="date"':''} required></label>`).join('');$('#entryForm').dataset.type=type;$('#entryDialog').showModal()}
$('#addStaffBtn').onclick=()=>openDialog('staff');$('#addParentBtn').onclick=()=>openDialog('parents');$('#addRequestBtn').onclick=()=>openDialog('requests');
$('#entryForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return; e.preventDefault();const f=new FormData(e.currentTarget);const obj=Object.fromEntries(f.entries());const type=e.currentTarget.dataset.type;if(type==='staff'){staff.push(obj);store.set('waslah_staff',staff)}if(type==='parents'){parents.push(obj);store.set('waslah_parents',parents)}if(type==='requests'){requests.push(obj);store.set('waslah_requests',requests)}$('#entryDialog').close();renderAll();toast('تم الحفظ')});

function normalizeRows(rows,type){const pick=(o,names)=>{for(const n of names){if(o[n]!=null&&o[n]!=='')return o[n]}return ''};if(type==='staff')return rows.map(o=>({name:pick(o,['الاسم','name','Name']),role:pick(o,['المسمى','المسمى الوظيفي','role','Role']),phone:pick(o,['الجوال','رقم الجوال','phone','Phone']),email:pick(o,['البريد','البريد الإلكتروني','email','Email'])})).filter(x=>x.name);return rows.map(o=>({parent:pick(o,['ولي الأمر','اسم ولي الأمر','parent','Parent']),student:pick(o,['الطالبة','اسم الطالبة','student','Student']),grade:pick(o,['الصف','grade','Grade']),phone:pick(o,['الجوال','رقم الجوال','phone','Phone'])})).filter(x=>x.parent||x.student)}
async function importFile(file,type){if(!file)return;try{let rows=[];if(file.name.toLowerCase().endsWith('.csv')){const text=await file.text();rows=parseCSV(text)}else{if(typeof XLSX==='undefined')throw new Error('تعذر تحميل قارئ Excel. جرّبي CSV.');const data=await file.arrayBuffer();const wb=XLSX.read(data);rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''})}const normalized=normalizeRows(rows,type);if(type==='staff')staff=normalized;else parents=normalized;renderAll();toast(`تم تحميل ${normalized.length} سجلًا. اضغطي حفظ البيانات.`)}catch(err){toast(err.message||'تعذر قراءة الملف')}}
function parseCSV(text){const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean);if(!lines.length)return[];const split=l=>{const out=[];let cur='',q=false;for(let i=0;i<l.length;i++){const c=l[i];if(c==='"'){if(q&&l[i+1]==='"'){cur+='"';i++}else q=!q}else if(c===','&&!q){out.push(cur.trim());cur=''}else cur+=c}out.push(cur.trim());return out};const headers=split(lines[0]);return lines.slice(1).map(l=>Object.fromEntries(split(l).map((v,i)=>[headers[i],v])))}
$('#staffFile').onchange=e=>importFile(e.target.files[0],'staff');$('#parentsFile').onchange=e=>importFile(e.target.files[0],'parents');
$('#saveStaffBtn').onclick=()=>{store.set('waslah_staff',staff);toast('تم حفظ بيانات الكادر')};$('#saveParentsBtn').onclick=()=>{store.set('waslah_parents',parents);toast('تم حفظ بيانات أولياء الأمور')};

$$('[data-template]').forEach(b=>b.onclick=()=>{const t=b.dataset.template;const csv=t==='staff'?'الاسم,المسمى الوظيفي,الجوال,البريد الإلكتروني\nمثال,مساعد إداري,0500000000,example@example.com':'اسم ولي الأمر,اسم الطالبة,الصف,الجوال\nمثال ولي الأمر,مثال الطالبة,الثالث ثانوي,0500000000';download((t==='staff'?'staff-template':'parents-template')+'.csv','\uFEFF'+csv,'text/csv;charset=utf-8')});
$('#exportJson').onclick=()=>download('waslah-backup.json',JSON.stringify({staff,parents,requests,notes:$('#dailyNotes').value,exportedAt:new Date().toISOString()},null,2),'application/json');
$('#clearData').onclick=()=>{if(confirm('سيتم حذف جميع البيانات المحلية. هل أنت متأكد؟')){['waslah_staff','waslah_parents','waslah_requests','waslah_notes'].forEach(k=>localStorage.removeItem(k));staff=[];parents=[];requests=[];$('#dailyNotes').value='';renderAll();toast('تم مسح البيانات')}};
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
renderAll();

document.querySelector('#entryForm button[value="cancel"]').onclick=(e)=>{e.preventDefault();document.querySelector('#entryDialog').close();};
