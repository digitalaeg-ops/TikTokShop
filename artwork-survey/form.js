// ฟอร์มแบบประเมิน 2 ลิงก์ — อ่านลิงก์จาก <body data-link="wholesale|channels">
(function(){
  var S = window.SURVEY, LINK = document.body.getAttribute('data-link'), L = S.links[LINK];
  var DRAFT = 'aw' + S.year + 'v2_' + LINK + '_draft', SENT = 'aw' + S.year + 'v2_' + LINK + '_sent';
  var store = {
    get: function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
    set: function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
    del: function(k){ try{ localStorage.removeItem(k); }catch(e){} }
  };
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function each(list, fn){ Array.prototype.forEach.call(list, fn); }
  var form = $('f'), restoring = false, steps = [], cur = 0, viewed = {}, galleries = {};
  var t0 = Date.now();   // เวลาที่เริ่มทำแบบประเมิน (ใช้ตรวจคนตอบเร็วผิดปกติ) — กู้จากร่างถ้ามี

  // ---------- builders ----------
  function q(name, label, inner, o){
    o = o || {};
    return '<div class="q" data-q="' + name + '"' + (o.req ? ' data-req="1"' : '') + (o.multi ? ' data-multi="1"' : '') + '>' +
      '<span class="q-label">' + esc(label) + (o.req ? ' <span class="req">*</span>' : '') + '</span>' +
      (o.hint ? '<div class="q-hint">' + esc(o.hint) + '</div>' : '') + (o.pre || '') + inner +
      '<div class="errmsg">' + esc(o.err || 'กรุณาตอบข้อนี้') + '</div></div>';
  }
  function pills(name, opts, type, cls){
    return '<div class="pills ' + (cls || '') + '">' + opts.map(function(o){
      var v = typeof o === 'string' ? o : (o.v || o.id), l = typeof o === 'string' ? o : (o.label || o.v);
      return '<label class="pill"><input type="' + (type || 'radio') + '" name="' + name + '" value="' + esc(v) + '"' +
        (o.text ? ' data-txt="1"' : '') + '><span>' + esc(l) + '</span></label>';
    }).join('') + '</div>';
  }
  function rating(name, na){
    return '<div class="rating">' + S.scale.map(function(l, i){
      return '<label title="' + esc(l) + '"><input type="radio" name="' + name + '" value="' + (i+1) + '"><span><b>' + (i+1) + '</b><small>' + esc(l) + '</small></span></label>';
    }).join('') + '</div>' +
    (na ? '<div class="na-pill"><label class="pill"><input type="radio" name="' + name + '" value="na"><span>' + esc(na) + '</span></label></div>' : '') +
    '<div class="rate-cap" data-cap="' + name + '"></div>';
  }
  function nps(name){
    var h = '<div class="nps">';
    for(var i = 0; i <= 10; i++) h += '<label><input type="radio" name="' + name + '" value="' + i + '"><span>' + i + '</span></label>';
    return h + '</div><div class="nps-ends"><span>0 = ไม่แนะนำเลย</span><span>10 = แนะนำแน่นอน</span></div>';
  }
  function area(name, ph){
    return '<textarea name="' + name + '" maxlength="2000" placeholder="' + esc(ph || '') + '"></textarea><div class="count" data-count="' + name + '">0 / 2000</div>';
  }
  function choice(name, sp){
    var t = sp.opts.filter(function(o){ return o.text; })[0];
    return pills(name, sp.opts) + (t ? '<input class="txtin" type="text" name="' + name + '__txt" maxlength="300" placeholder="' + esc(t.text) + '" hidden>' : '');
  }

  // ---------- render sections ----------
  var groupsAvail = L.groups;
  var html = '';
  // ส่วนกลาง
  html += '<section class="card step" data-sid="about"><h2 style="margin:0 0 14px">เกี่ยวกับคุณ</h2>' +
    (groupsAvail.length > 1 ? q('groups', 'กลุ่มที่คุณรับผิดชอบ', pills('groups', groupsAvail.map(function(g){ return { v:g, label:S.groups[g].pickLabel || S.groups[g].label }; }), 'checkbox', 'big-pills'),
      { req:1, multi:1, hint:'เลือกได้หลายข้อ — ระบบจะแสดงเฉพาะชุดคำถามของกลุ่มที่เลือก', err:'กรุณาเลือกอย่างน้อย 1 กลุ่ม' }) : '') +
    q('role', 'ตำแหน่ง / บทบาทของคุณ', pills('role', S.roles), { req:1 }) +
    q('usage_freq', 'คุณใช้งาน Artwork Promotion บ่อยแค่ไหน', pills('usage_freq', S.freqs), { req:1 }) +
    '</section>';

  groupsAvail.forEach(function(g){
    var G = S.groups[g], chip = '<span class="gchip gc-' + g + '">' + esc(G.label) + '</span>';
    // ดู Artwork
    html += '<section class="card step" data-sid="view-' + g + '" hidden>' +
      '<div class="step-h">' + chip + '<h2>ดู Artwork ' + esc(G.label) + ' ปี ' + S.year + '</h2></div>' +
      '<p class="muted" style="margin:0">' + esc(G.intro) + '</p>' +
      '<div class="view-note">กรุณาเปิดดู Artwork <b>ให้ครบทุกเดือน</b> ก่อนตอบ (กดชื่อเดือนด้านล่าง · กดรูปเพื่อขยาย) — ปุ่ม “ถัดไป” จะกดได้เมื่อดูครบ</div>' +
      '<div class="gal" data-gal="' + g + '"></div><div class="view-need" data-need="' + g + '"></div></section>';
    // คำถาม
    var p = g + '__';
    var body = '';
    if(G.ch.length){
      body += '<h3 class="sec-t">ให้คะแนนความพึงพอใจรายช่องทาง' + (G.chNA ? ' <span class="muted small" style="font-weight:400">(ให้คะแนนเฉพาะแพลตฟอร์มที่ดูแล)</span>' : '') + '</h3><div class="rows">' +
        G.ch.map(function(c){ return q(p + 'ch__' + c.id, c.label, rating(p + 'ch__' + c.id, G.chNA), { req:1 }); }).join('') + '</div>';
    }
    body += '<h3 class="sec-t">ให้คะแนนความพึงพอใจหลัก 5 ข้อ</h3><p class="q-hint" style="margin:-2px 0 6px">1 = ต้องปรับปรุงมาก · 5 = ดีมาก</p><div class="rows">' +
      S.core.map(function(c){ return q(p + 'core__' + c.id, c.label, rating(p + 'core__' + c.id), { req:1 }); }).join('') + '</div>';
    body += '<h3 class="sec-t">คำถามเฉพาะกลุ่ม ' + esc(G.label) + '</h3><div class="rows">';
    G.sp.forEach(function(sp){
      var n = p + 'sp__' + sp.id, pre = sp.img ? AWG.qImages(S.questionImages[sp.img], sp.label) : '';
      if(sp.type === 'rate') body += q(n, sp.label, rating(n), { req:sp.req, pre:pre });
      else if(sp.type === 'choice') body += q(n, sp.label, choice(n, sp), { req:sp.req, pre:pre, err:'กรุณาตอบข้อนี้ (ถ้าเลือกข้อที่มีช่องพิมพ์ กรุณาพิมพ์ด้วย)' });
      else body += '</div>' + q(n, sp.label, area(n, sp.ph), { hint:'ไม่บังคับ' }) + '<div class="rows">';
    });
    body += '</div>';
    body += '<h3 class="sec-t">ภาพรวม</h3>' + q(p + 'sat', 'ความพึงพอใจโดยรวมต่อ Artwork ' + G.label + ' ปี ' + S.year, rating(p + 'sat'), { req:1 });
    html += '<section class="card step" data-sid="q-' + g + '" hidden>' +
      '<div class="step-h">' + chip + '<h2>ประเมิน Artwork ' + esc(G.label) + '</h2><button class="btn sm" type="button" data-regal="' + g + '">🖼 เปิดดู Artwork อีกครั้ง</button></div>' +
      '<p class="q-hint" style="margin:0 0 6px">ข้อที่มี <span style="color:var(--coral)">*</span> ต้องตอบ</p>' + body + '</section>';
  });

  // ส่วนท้าย
  html += '<section class="card step" data-sid="end" hidden><h2 style="margin:0 0 4px">ภาพรวมและแนวทางปี ' + S.nextYear + '</h2>' +
    '<p class="q-hint" style="margin:0 0 16px">ตอบครั้งเดียว — เป็นความเห็นต่อการทำงาน Artwork โดยรวม</p>' +
    q('vs_last_year', 'เมื่อเทียบกับปี ' + (S.year - 1) + ' Artwork ปีนี้เป็นอย่างไร', pills('vs_last_year', S.vsLastYear), { req:1 }) +
    q('nps', 'คุณจะแนะนำให้ใช้แนวทางการออกแบบแบบปี ' + S.year + ' ต่อไปมากน้อยแค่ไหน', nps('nps'), { req:1 }) +
    q('improve', 'ปี ' + S.nextYear + ' อยากให้ปรับปรุงเรื่องใดมากที่สุด', pills('improve', S.improve, 'checkbox') + '<div class="limit" id="improveLimit"></div>',
      { req:1, multi:1, hint:'เลือกได้สูงสุด ' + S.improveMax + ' ข้อ', err:'กรุณาเลือกอย่างน้อย 1 ข้อ' }) +
    q('formats', 'รูปแบบงานที่อยากได้เพิ่มในปี ' + S.nextYear, pills('formats', S.formats, 'checkbox'), { hint:'เลือกได้หลายข้อ (ไม่บังคับ)' }) +
    q('lead_time', 'อยากได้รับ Artwork ล่วงหน้าก่อนเริ่มโปรโมชั่นนานแค่ไหน', pills('lead_time', S.leadTimes), { req:1 }) +
    q('problems', 'ปัญหา / อุปสรรคที่พบในการใช้งาน Artwork', area('problems', 'เช่น ได้งานช้า ขนาดไม่พอดีช่องทาง ข้อความเยอะเกินไป'), { hint:'ไม่บังคับ' }) +
    q('suggestions', 'ข้อเสนอแนะสำหรับการออกแบบปี ' + S.nextYear, area('suggestions', 'อยากให้ปีหน้าเป็นแบบไหน'), { hint:'ไม่บังคับ แต่มีประโยชน์มาก' }) +
    '</section>';
  $('steps').innerHTML = html;

  // ---------- helpers ----------
  function val(name){ var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; }
  function vals(name){ return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function(e){ return e.value; }); }
  function txtVal(name){ var t = form.querySelector('[name="' + name + '"]'); return t && !t.hidden ? t.value.trim() : ''; }
  function selGroups(){ return groupsAvail.length === 1 ? groupsAvail.slice() : groupsAvail.filter(function(g){ return vals('groups').indexOf(g) > -1; }); }
  function sec(sid){ return form.querySelector('.step[data-sid="' + sid + '"]'); }

  function computeSteps(){
    var s = ['about'];
    selGroups().forEach(function(g){ s.push('view-' + g, 'q-' + g); });
    s.push('end');
    steps = s;
    var prog = $('prog'); prog.innerHTML = '';
    steps.forEach(function(){ prog.appendChild(document.createElement('i')); });
  }
  function updateCap(name){
    var cap = form.querySelector('[data-cap="' + name + '"]'); if(!cap) return;
    var v = val(name); cap.textContent = !v ? '' : v === 'na' ? '' : (v + ' – ' + S.scale[v - 1]);
  }
  function updateTxt(name){
    var t = form.querySelector('input[name="' + name + '__txt"]'); if(!t) return;
    var c = form.querySelector('input[name="' + name + '"]:checked');
    t.hidden = !(c && c.hasAttribute('data-txt'));
  }
  function updateImproveLimit(){
    var n = vals('improve').length, max = S.improveMax;
    each(form.querySelectorAll('input[name="improve"]'), function(e){ e.disabled = !e.checked && n >= max; });
    $('improveLimit').textContent = n ? ('เลือกแล้ว ' + n + ' / ' + max + (n >= max ? ' — ถ้าจะเปลี่ยน ให้กดยกเลิกข้อเดิมก่อน' : '')) : '';
  }
  function updateCount(name){
    var t = form.querySelector('textarea[name="' + name + '"]'), c = form.querySelector('[data-count="' + name + '"]');
    if(t && c) c.textContent = t.value.length + ' / 2000';
  }

  // ---------- gallery steps ----------
  function ensureGallery(g){
    if(galleries[g]) return galleries[g];
    galleries[g] = AWG.render(form.querySelector('[data-gal="' + g + '"]'), g, {
      track: true, viewed: viewed[g] || [],
      onView: function(list){ viewed[g] = list; if(galleries[g]) updateViewNeed(g); saveDraft(); }
    });
    viewed[g] = galleries[g].seen();
    return galleries[g];
  }
  function updateViewNeed(g){
    if(steps[cur] !== 'view-' + g) return;
    var gl = galleries[g], left = gl.total - gl.seen().length;
    $('nextBtn').disabled = left > 0;
    form.querySelector('[data-need="' + g + '"]').textContent = left > 0 ? 'ยังเหลืออีก ' + left + ' เดือนที่ยังไม่ได้เปิดดู' : '';
  }

  // ---------- draft ----------
  function snapshot(){
    var o = { _step: steps[cur], _viewed: viewed, _t0: t0 };
    each(form.querySelectorAll('input:checked'), function(e){
      if(e.type === 'checkbox'){ (o[e.name] = o[e.name] || []).push(e.value); } else { o[e.name] = e.value; }
    });
    each(form.querySelectorAll('textarea, input[type="text"]'), function(t){ if(t.value) o[t.name] = t.value; });
    return o;
  }
  var saveT;
  function saveDraft(){
    if(restoring) return;
    clearTimeout(saveT);
    saveT = setTimeout(function(){ store.set(DRAFT, JSON.stringify(snapshot())); $('saved').textContent = 'บันทึกร่างแล้ว ✓'; }, 300);
  }
  function restoreDraft(){
    var raw = store.get(DRAFT); if(!raw) return null;
    var o; try{ o = JSON.parse(raw); }catch(e){ return null; }
    restoring = true;
    viewed = o._viewed || {};
    if(typeof o._t0 === 'number' && o._t0 <= Date.now()) t0 = o._t0;
    Object.keys(o).forEach(function(n){
      if(n.charAt(0) === '_') return;
      var v = o[n];
      if(Array.isArray(v)) v.forEach(function(x){ var el = form.querySelector('input[name="' + n + '"][value="' + CSS.escape(x) + '"]'); if(el) el.checked = true; });
      else {
        var t = form.querySelector('textarea[name="' + n + '"], input[type="text"][name="' + n + '"]');
        if(t){ t.value = v; updateCount(n); }
        else { var el = form.querySelector('input[name="' + n + '"][value="' + CSS.escape(v) + '"]'); if(el){ el.checked = true; updateCap(n); updateTxt(n); } }
      }
    });
    updateImproveLimit();
    restoring = false;
    $('saved').textContent = 'กู้คืนคำตอบที่ตอบค้างไว้แล้ว';
    return o._step || null;
  }

  // ---------- validation & navigation ----------
  function validate(sid){
    var s = sec(sid), first = null;
    if(sid.indexOf('view-') === 0){
      var g = sid.slice(5), gl = ensureGallery(g);
      if(!gl.complete()) first = s.querySelector('.gal');
    }
    each(s.querySelectorAll('.q[data-req]'), function(qe){
      var name = qe.getAttribute('data-q');
      var ok = qe.hasAttribute('data-multi') ? vals(name).length > 0 : !!val(name);
      if(ok){ var t = form.querySelector('input[name="' + name + '__txt"]'); if(t && !t.hidden && !t.value.trim()) ok = false; }
      qe.classList.toggle('err', !ok);
      if(!ok && !first) first = qe;
    });
    if(first) first.scrollIntoView({ behavior:'smooth', block:'center' });
    return !first;
  }
  function show(i){
    cur = Math.max(0, Math.min(steps.length - 1, i));
    var sid = steps[cur];
    each(form.querySelectorAll('.step'), function(s){ s.hidden = s.getAttribute('data-sid') !== sid; });
    each($('prog').children, function(b, k){ b.classList.toggle('on', k <= cur); });
    $('stepNo').textContent = cur + 1; $('stepAll').textContent = steps.length;
    var name = sid === 'about' ? 'เกี่ยวกับคุณ' : sid === 'end' ? 'ภาพรวมและแนวทางปี ' + S.nextYear :
      (sid.indexOf('view-') === 0 ? 'ดู Artwork ' : 'ประเมิน Artwork ') + S.groups[sid.replace(/^(view|q)-/, '')].label;
    $('stepName').textContent = name;
    $('intro').hidden = cur !== 0;
    $('backBtn').style.visibility = cur === 0 ? 'hidden' : 'visible';
    $('nextBtn').hidden = cur === steps.length - 1;
    $('nextBtn').disabled = false;
    $('submitBtn').hidden = cur !== steps.length - 1;
    $('submitErr').hidden = true;
    if(sid.indexOf('view-') === 0){ var g = sid.slice(5); ensureGallery(g); updateViewNeed(g); }
  }
  function go(i){ show(i); saveDraft(); window.scrollTo({ top:0, behavior:'smooth' }); }

  $('nextBtn').addEventListener('click', function(){ if(validate(steps[cur])) go(cur + 1); });
  $('backBtn').addEventListener('click', function(){ if(cur > 0) go(cur - 1); });
  form.addEventListener('click', function(e){
    var b = e.target.closest('[data-regal]');
    if(b) AWG.modal(b.getAttribute('data-regal'));
  });

  form.addEventListener('change', function(e){
    var t = e.target;
    if(t.name === 'groups') computeSteps();
    if(t.name === 'improve') updateImproveLimit();
    if(t.type === 'radio'){ updateCap(t.name); updateTxt(t.name); }
    var qe = t.closest('.q');
    if(qe && qe.classList.contains('err')){
      var name = qe.getAttribute('data-q');
      if(qe.hasAttribute('data-multi') ? vals(name).length : val(name)){
        var tx = form.querySelector('input[name="' + name + '__txt"]');
        if(!tx || tx.hidden || tx.value.trim()) qe.classList.remove('err');
      }
    }
    if(t.type === 'radio' && !restoring){
      var tx2 = form.querySelector('input[name="' + t.name + '__txt"]');
      if(tx2 && !tx2.hidden) tx2.focus();
    }
    saveDraft();
  });
  form.addEventListener('input', function(e){
    if(e.target.tagName === 'TEXTAREA') updateCount(e.target.name);
    if(e.target.tagName === 'TEXTAREA' || e.target.type === 'text') saveDraft();
  });

  // ---------- submit ----------
  function payload(){
    var ga = {};
    selGroups().forEach(function(g){
      var G = S.groups[g], p = g + '__', a = { sat: +val(p + 'sat'), core: {}, sp: {}, viewed_months: (viewed[g] || []).length };
      if(G.ch.length){ a.ch = {}; G.ch.forEach(function(c){ var v = val(p + 'ch__' + c.id); a.ch[c.id] = v === 'na' ? 'na' : +v; }); }
      S.core.forEach(function(c){ a.core[c.id] = +val(p + 'core__' + c.id); });
      G.sp.forEach(function(sp){
        var n = p + 'sp__' + sp.id;
        if(sp.type === 'rate'){ var r = val(n); if(r) a.sp[sp.id] = +r; }
        else if(sp.type === 'choice'){ var c = val(n); if(c) a.sp[sp.id] = c; var tx = txtVal(n + '__txt'); if(tx) a.sp[sp.id + '_text'] = tx; }
        else { var t = form.querySelector('textarea[name="' + n + '"]'); if(t && t.value.trim()) a.sp[sp.id] = t.value.trim(); }
      });
      ga[g] = a;
    });
    function txt(n){ var t = form.querySelector('textarea[name="' + n + '"]'); var v = t ? t.value.trim() : ''; return v || null; }
    return {
      survey_year: S.year, link: LINK, groups: selGroups(), role: val('role'), usage_freq: val('usage_freq'),
      group_answers: ga, vs_last_year: val('vs_last_year'), nps: +val('nps'),
      improve: vals('improve'), formats: vals('formats'), lead_time: val('lead_time'),
      problems: txt('problems'), suggestions: txt('suggestions'),
      duration_sec: Math.max(0, Math.min(2592000, Math.round((Date.now() - t0) / 1000)))
    };
  }
  // ---------- ปิดรับคำตอบ ----------
  var closeAt = L.closeAt ? new Date(L.closeAt) : null;
  function isClosed(){ return closeAt && Date.now() > closeAt.getTime(); }
  // โหมดดูตัวอย่าง (?preview=1): เปิดดูคำถามได้แม้ปิดรับแล้ว แต่ส่งคำตอบไม่ได้
  var PREVIEW = /[?&]preview=1(&|$)/.test(location.search);
  if(PREVIEW){
    var pv = document.createElement('div');
    pv.className = 'view-note'; pv.style.cssText = 'background:#FFF4E0;color:#8A5A00;margin:0 0 14px';
    pv.innerHTML = '👀 <b>โหมดดูตัวอย่าง</b> — ใช้ดูคำถามเท่านั้น กดส่งคำตอบไม่ได้';
    $('intro').parentNode.insertBefore(pv, $('intro'));
  }
  function showClosed(){
    $('formArea').hidden = true; $('intro').hidden = true; $('already').hidden = true; $('done').hidden = true; $('closed').hidden = false;
    window.scrollTo({ top:0 });
  }
  if(closeAt){
    $('deadline').hidden = false;
    $('deadline').textContent = '⏰ ปิดรับคำตอบ ' + L.closeText;
    $('closedWhen').textContent = L.closeText;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(PREVIEW){ var pe = $('submitErr'); pe.textContent = 'โหมดดูตัวอย่าง — ส่งคำตอบไม่ได้ (ข้อมูลไม่ถูกบันทึก)'; pe.hidden = false; return; }
    if(isClosed()){ showClosed(); return; }
    for(var i = 0; i < steps.length; i++){ if(!validate(steps[i])){ show(i); validate(steps[i]); return; } }
    var btn = $('submitBtn'), err = $('submitErr');
    btn.disabled = true; btn.textContent = 'กำลังส่ง...'; err.hidden = true;
    fetch(S.supabaseUrl + '/rest/v1/' + S.table, {
      method: 'POST',
      headers: { 'apikey': S.anonKey, 'Authorization': 'Bearer ' + S.anonKey, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload())
    }).then(function(r){
      if(!r.ok) return r.text().then(function(t){
        if(isClosed() || /row-level security/i.test(t)){ var x = new Error('closed'); x.closed = true; throw x; }
        throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 160));
      });
      store.del(DRAFT); store.set(SENT, new Date().toISOString());
      $('formArea').hidden = true; $('intro').hidden = true; $('done').hidden = false;
      window.scrollTo({ top:0, behavior:'smooth' });
    }).catch(function(ex){
      if(ex.closed){ showClosed(); return; }
      err.textContent = 'ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง (คำตอบยังบันทึกอยู่ในเครื่อง) — ' + ex.message;
      err.hidden = false;
    }).then(function(){ btn.disabled = false; btn.textContent = 'ส่งแบบประเมิน ✓'; });
  });

  // ---------- start ----------
  $('againBtn').addEventListener('click', function(){
    store.del(SENT); t0 = Date.now(); $('already').hidden = true; $('formArea').hidden = false; $('intro').hidden = false; show(0);
  });
  var savedStep = restoreDraft();
  computeSteps();
  if(isClosed() && !PREVIEW) showClosed();
  else if(!PREVIEW && store.get(SENT) && !savedStep){ $('already').hidden = false; $('formArea').hidden = true; $('intro').hidden = true; }
  else show(Math.max(0, steps.indexOf(savedStep)));
})();
