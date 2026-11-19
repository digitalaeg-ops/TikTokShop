// แกลเลอรี Artwork (ต้องโหลด survey-config.js และ aw-data.js ก่อน)
window.AWG = (function(){
  var S = window.SURVEY, D = window.AW || {};
  var PF = [['shopee', 'Shopee'], ['lazada', 'Lazada'], ['tiktok', 'TikTok Shop']];
  // Website: แสดง Banner แนวนอนก่อน รูปใหญ่ (สี่เหลี่ยม / แนวตั้ง) ไว้หลังสุด — คงลำดับเดิมภายในแต่ละแบบ
  Object.keys(D.website || {}).forEach(function(mm){
    var b = D.website[mm].banner;
    if(b) D.website[mm].banner = b.filter(function(x){ return x.w / x.h >= 1.6; }).concat(b.filter(function(x){ return x.w / x.h < 1.6; }));
  });
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function mLabel(mm){ return S.months[+mm - 1]; }
  function mFull(mm){ return S.monthsFull[+mm - 1]; }

  function months(g){ return Object.keys(D[g] || {}).sort(); }
  function count(g, mm){
    var o = (D[g] || {})[mm] || {}, n = 0;
    Object.keys(o).forEach(function(k){
      if(k === 'line') o.line.forEach(function(r){ n += r.cards.length; }); else n += o[k].length;
    });
    return n;
  }
  function item(ref){
    var o = ((D[ref.g] || {})[ref.m] || {})[ref.k];
    if(!o) return null;
    if(ref.k === 'line'){ var r = o[ref.r || 0]; return r ? r.cards[ref.i || 0] : null; }
    return o[ref.i || 0] || null;
  }

  // ---------- lightbox ----------
  var lb = null, lbItems = [], lbIdx = 0, lbCap = '';
  function lbShow(){
    var it = lbItems[lbIdx];
    lb.querySelector('img').src = it.f;
    lb.querySelector('img').alt = lbCap;
    lb.querySelector('.cap').textContent = lbCap + (lbItems.length > 1 ? ' · ' + (lbIdx + 1) + ' / ' + lbItems.length : '');
    lb.querySelector('.pv').disabled = lbIdx === 0;
    lb.querySelector('.nx').disabled = lbIdx === lbItems.length - 1;
    // โหลดรูปถัดไปรอไว้
    [lbIdx - 1, lbIdx + 1].forEach(function(i){ if(lbItems[i]){ var p = new Image(); p.src = lbItems[i].f; } });
  }
  function lbClose(){ if(!lb) return; lb.remove(); lb = null; if(!document.querySelector('.awmodal')) document.body.classList.remove('awlock'); document.removeEventListener('keydown', lbKey); }
  function lbKey(e){
    if(e.key === 'Escape'){ e.stopPropagation(); lbClose(); }
    else if(e.key === 'ArrowLeft' && lbIdx > 0){ lbIdx--; lbShow(); }
    else if(e.key === 'ArrowRight' && lbIdx < lbItems.length - 1){ lbIdx++; lbShow(); }
  }
  function lightbox(items, idx, cap){
    lbClose();
    lbItems = items; lbIdx = idx || 0; lbCap = cap || '';
    lb = document.createElement('div');
    lb.className = 'awlb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="x" type="button" aria-label="ปิด">✕</button><button class="pv" type="button" aria-label="ก่อนหน้า">‹</button>' +
      '<img alt=""><div class="cap"></div><button class="nx" type="button" aria-label="ถัดไป">›</button>';
    document.body.appendChild(lb); document.body.classList.add('awlock');
    lb.addEventListener('click', function(e){
      if(e.target === lb || e.target.classList.contains('x')) lbClose();
      else if(e.target.classList.contains('pv') && lbIdx > 0){ lbIdx--; lbShow(); }
      else if(e.target.classList.contains('nx') && lbIdx < lbItems.length - 1){ lbIdx++; lbShow(); }
    });
    var sx = null;
    lb.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive:true });
    lb.addEventListener('touchend', function(e){
      if(sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if(dx > 50 && lbIdx > 0){ lbIdx--; lbShow(); } else if(dx < -50 && lbIdx < lbItems.length - 1){ lbIdx++; lbShow(); }
    });
    document.addEventListener('keydown', lbKey);
    lbShow();
    lb.querySelector('.x').focus();
  }

  // ---------- builders ----------
  var reg = {}, regN = 0;   // ชุดรูปสำหรับ lightbox
  function setOf(items, cap){ var id = 's' + (++regN); reg[id] = { items:items, cap:cap }; return id; }
  function thumb(it, set, i, cls){
    var r = it.h / it.w;
    return '<button type="button" class="awg-th ' + (cls || '') + '" data-set="' + set + '" data-i="' + i + '" aria-label="ขยายรูป">' +
      '<img loading="lazy" decoding="async" src="' + esc(it.t) + '" alt="" style="aspect-ratio:' + it.w + '/' + it.h + '"></button>';
  }
  function grid(items, cap, sq){
    var set = setOf(items, cap);
    return '<div class="awg-grid' + (sq ? ' sq' : '') + '">' + items.map(function(it, i){ return thumb(it, set, i); }).join('') + '</div>';
  }
  // ชื่อรอบ: โฟลเดอร์ 1,2,3 = ลำดับ · โฟลเดอร์ที่เป็นวันที่ (เช่น "10 วาเลนไทน์") = วันที่ส่ง
  function roundLabel(rounds, i, mm){
    var nm = String(rounds[i].name).trim();
    if(nm === String(i + 1)) return 'รอบที่ ' + (i + 1);
    return 'รอบที่ ' + (i + 1) + ' · ' + nm.replace(/^(\d{1,2})(?!\d)/, '$1 ' + mLabel(mm));
  }
  function phone(rounds, cap, uid, mm){
    return '<div class="phone-wrap" data-phone="' + uid + '">' +
      (rounds.length > 1 ? '<div class="rounds">' + rounds.map(function(r, i){
        return '<button type="button" data-round="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(roundLabel(rounds, i, mm)) + '</button>';
      }).join('') + '</div>' : '') +
      '<div class="phone"><div class="scr">' +
        '<div class="sb"><span>11:00</span><span class="notch"></span><span>5G ▮</span></div>' +
        '<div class="lh"><span class="bk">‹</span>SANWA Retail Shop <span class="ok">OA</span></div>' +
        '<div class="chat"><span class="day">อังคาร 11:00 น.</span><div class="row"><span class="av"></span><div class="col"><div class="who">SANWA</div>' +
        '<div class="lc-track"></div><div class="tm">11:00</div></div></div></div>' +
      '</div></div>' +
      '<div class="lc-nav"><button type="button" data-lc="-1" aria-label="การ์ดก่อนหน้า">‹</button><span class="lc-pos"></span><button type="button" data-lc="1" aria-label="การ์ดถัดไป">›</button></div>' +
      '</div>';
  }
  function fillPhone(wrap, rounds, ri, cap, mm){
    var r = rounds[ri], set = setOf(r.cards, cap + ' · LINE card ' + roundLabel(rounds, ri, mm));
    var tr = wrap.querySelector('.lc-track');
    tr.innerHTML = r.cards.map(function(c, i){
      return '<button type="button" class="lc-card" data-set="' + set + '" data-i="' + i + '" aria-label="ขยาย LINE card ' + (i + 1) + '">' +
        '<img loading="lazy" decoding="async" src="' + esc(c.f) + '" alt="" style="aspect-ratio:' + c.w + '/' + c.h + '"></button>';
    }).join('');
    tr.scrollLeft = 0;
    Array.prototype.forEach.call(wrap.querySelectorAll('[data-round]'), function(b){ b.setAttribute('aria-pressed', +b.getAttribute('data-round') === ri); });
    updPos(wrap);
  }
  function updPos(wrap){
    var tr = wrap.querySelector('.lc-track'), cards = tr.children;
    if(!cards.length) return;
    var w = cards[0].offsetWidth + 8, i = w ? Math.round(tr.scrollLeft / w) : 0;
    i = Math.max(0, Math.min(cards.length - 1, i));
    wrap.querySelector('.lc-pos').textContent = 'การ์ด ' + (i + 1) + ' / ' + cards.length;
    wrap.querySelector('[data-lc="-1"]').disabled = i === 0;
    wrap.querySelector('[data-lc="1"]').disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4;
  }
  function browser(items, cap, uid){
    return '<div data-web="' + uid + '"><div class="browser"><div class="bt"><span class="dots"><i></i><i></i><i></i></span><span class="url">🔒 www.sanwa.co.th</span></div>' +
      '<div class="nav"><img src="logosanwa.png" alt="SANWA"><i></i><i></i><i></i><i></i></div>' +
      '<div class="stage"><button type="button" class="img" data-set="' + setOf(items, cap + ' · Banner เว็บไซต์') + '" data-i="0" aria-label="ขยาย Banner"><img alt=""></button>' +
      (items.length > 1 ? '<button type="button" class="arr l" data-web-go="-1" aria-label="Banner ก่อนหน้า">‹</button><button type="button" class="arr r" data-web-go="1" aria-label="Banner ถัดไป">›</button>' : '') +
      '</div><div class="dotsbar">' + items.map(function(_, i){ return '<i data-web-i="' + i + '"></i>'; }).join('') + '</div>' +
      '<div class="fake"><i></i><i></i><i></i><i></i></div></div>' +
      '<div class="web-strip">' + items.map(function(it, i){ return '<button type="button" data-web-i="' + i + '" aria-label="Banner ' + (i + 1) + '"><img loading="lazy" src="' + esc(it.t) + '" alt=""></button>'; }).join('') + '</div></div>';
  }
  function webShow(wrap, items, i){
    i = (i + items.length) % items.length;
    wrap._i = i;
    var b = wrap.querySelector('.stage .img'); b.setAttribute('data-i', i);
    b.querySelector('img').src = items[i].f;
    b.querySelector('img').style.aspectRatio = items[i].w + '/' + items[i].h;
    Array.prototype.forEach.call(wrap.querySelectorAll('.dotsbar i'), function(d, k){ d.classList.toggle('on', k === i); });
    Array.prototype.forEach.call(wrap.querySelectorAll('.web-strip button'), function(d, k){ d.setAttribute('aria-pressed', k === i); });
  }

  function monthHtml(g, mm, uid){
    var o = D[g][mm], cap = S.groups[g].label + ' · ' + mFull(mm);
    if(g === 'wholesale') return '<div class="awg-sec"><h4>A4 ส่งทีม Sale <span class="cnt">' + o.a4.length + ' ชิ้น</span></h4>' + grid(o.a4, cap + ' · A4') + '</div>';
    if(g === 'retail'){
      var left = o.a4 ? '<div class="awg-sec"><h4>A4 ส่งทีม Sale <span class="cnt">' + o.a4.length + ' ชิ้น</span></h4>' + grid(o.a4, cap + ' · A4') + '</div>' : '';
      var right = o.line ? '<div class="awg-sec"><h4>LINE card · Broadcast LINE OA <span class="cnt">' + o.line.length + ' รอบ</span></h4>' + phone(o.line, cap, uid, mm) + '</div>' : '';
      return '<div class="awg-rt">' + (left || '<div></div>') + right + '</div>';
    }
    if(g === 'marketplace') return PF.filter(function(p){ return o[p[0]]; }).map(function(p){
      return '<div class="awg-sec"><h4><span class="pf-dot pf-' + p[0] + '"></span>' + p[1] + ' <span class="cnt">' + o[p[0]].length + ' ชิ้น</span></h4>' + grid(o[p[0]], cap + ' · ' + p[1], true) + '</div>';
    }).join('');
    if(g === 'website') return '<div class="awg-sec"><h4>Banner เว็บไซต์ <span class="cnt">' + o.banner.length + ' ชิ้น</span></h4>' + browser(o.banner, cap, uid) + '</div>';
    return '';
  }

  // ---------- gallery ----------
  var uidN = 0;
  function render(el, g, opts){
    opts = opts || {};
    var ms = months(g), seen = (opts.viewed || []).filter(function(m){ return ms.indexOf(m) > -1; });
    var uid = 'g' + (++uidN), cur = null;
    if(!ms.length){ el.innerHTML = '<div class="rows-empty">ยังไม่มีไฟล์ Artwork ของกลุ่มนี้</div>'; return { complete:function(){ return true; } }; }
    el.innerHTML = '<div class="awg-head">' + (opts.track ? '<span class="awg-bar"><i></i></span><span class="awg-prog"></span>' :
        '<span class="awg-prog">มีงาน ' + ms.length + ' เดือน · กดเดือนเพื่อดู กดรูปเพื่อขยาย</span>') + '</div>' +
      '<div class="awg-tabs" role="tablist">' + ms.map(function(mm){
        return '<button type="button" role="tab" data-m="' + mm + '" aria-pressed="false">' + mLabel(mm) + '<small>' + count(g, mm) + ' ชิ้น</small></button>';
      }).join('') + '</div><div class="awg-month" id="' + uid + '"></div>';
    var box = el.querySelector('.awg-month');
    function prog(){
      if(!opts.track) return;
      var n = seen.length, t = ms.length, p = el.querySelector('.awg-prog');
      p.innerHTML = n >= t ? '<b>✓ ดูครบ ' + t + ' เดือนแล้ว</b>' : 'ดูแล้ว <b>' + n + ' / ' + t + '</b> เดือน · กดเดือนที่ยังไม่มีเครื่องหมาย ✓ ให้ครบ';
      p.classList.toggle('done', n >= t);
      el.querySelector('.awg-bar i').style.width = (n / t * 100) + '%';
      Array.prototype.forEach.call(el.querySelectorAll('.awg-tabs button'), function(b){ b.classList.toggle('seen', seen.indexOf(b.getAttribute('data-m')) > -1); });
    }
    function open(mm){
      cur = mm;
      Array.prototype.forEach.call(el.querySelectorAll('.awg-tabs button'), function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-m') === mm); });
      box.innerHTML = monthHtml(g, mm, uid);
      var o = D[g][mm];
      var pw = box.querySelector('[data-phone]');
      if(pw){
        fillPhone(pw, o.line, 0, S.groups[g].label + ' · ' + mFull(mm), mm);
        pw.querySelector('.lc-track').addEventListener('scroll', function(){ updPos(pw); }, { passive:true });
        setTimeout(function(){ updPos(pw); }, 60);
      }
      var ww = box.querySelector('[data-web]');
      if(ww) webShow(ww, o.banner, 0);
      if(opts.track && seen.indexOf(mm) < 0){ seen.push(mm); seen.sort(); if(opts.onView) opts.onView(seen.slice()); }
      prog();
    }
    el.addEventListener('click', function(e){
      var t;
      if((t = e.target.closest('.awg-tabs button'))){ open(t.getAttribute('data-m')); return; }
      if((t = e.target.closest('[data-round]'))){ var pw = t.closest('[data-phone]'); fillPhone(pw, D[g][cur].line, +t.getAttribute('data-round'), S.groups[g].label + ' · ' + mFull(cur), cur); return; }
      if((t = e.target.closest('[data-lc]'))){
        var tr = t.closest('[data-phone]').querySelector('.lc-track'), c = tr.children[0];
        if(c) tr.scrollBy({ left: (+t.getAttribute('data-lc')) * (c.offsetWidth + 8), behavior:'smooth' });
        return;
      }
      if((t = e.target.closest('[data-web-go]'))){ var w = t.closest('[data-web]'); webShow(w, D[g][cur].banner, (w._i || 0) + (+t.getAttribute('data-web-go'))); return; }
      if((t = e.target.closest('[data-web-i]'))){ var w2 = t.closest('[data-web]'); webShow(w2, D[g][cur].banner, +t.getAttribute('data-web-i')); return; }
    });
    // เปิดเดือนแรกที่ยังไม่ได้ดู (หรือเดือนแรก)
    var first = ms.filter(function(m){ return seen.indexOf(m) < 0; })[0] || ms[0];
    if(opts.track) prog();
    open(first);
    return {
      complete: function(){ return seen.length >= ms.length; },
      seen: function(){ return seen.slice(); },
      total: ms.length
    };
  }

  // คลิกรูป → lightbox (ทั้งหน้า)
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-set]');
    if(!t || !reg[t.getAttribute('data-set')]) return;
    var s = reg[t.getAttribute('data-set')];
    lightbox(s.items, +t.getAttribute('data-i') || 0, s.cap);
  });

  // ---------- modal ดู Artwork ซ้ำ ----------
  function modal(g, title){
    var m = document.createElement('div');
    m.className = 'awmodal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="panel"><div class="mh"><h3>' + esc(title || ('Artwork ' + S.groups[g].label + ' ปี ' + S.year)) + '</h3>' +
      '<button class="btn sm" type="button" data-close>ปิด ✕</button></div><div class="mg"></div></div>';
    document.body.appendChild(m); document.body.classList.add('awlock');
    render(m.querySelector('.mg'), g, {});
    function close(){ m.remove(); document.removeEventListener('keydown', key); if(!document.querySelector('.awlb')) document.body.classList.remove('awlock'); }
    function key(e){ if(e.key === 'Escape' && !document.querySelector('.awlb')) close(); }
    m.addEventListener('click', function(e){ if(e.target === m || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', key);
    m.querySelector('[data-close]').focus();
  }

  // ---------- รูปประกอบคำถาม ----------
  function qImages(refs, label){
    var items = (refs || []).map(item).filter(Boolean);
    if(!items.length) return '';
    var set = setOf(items, label || 'รูปประกอบ');
    return '<div class="q-imgs"><span class="lbl">รูปประกอบ (กดเพื่อขยาย)</span>' + items.map(function(it, i){ return thumb(it, set, i); }).join('') + '</div>';
  }

  return { months:months, count:count, render:render, modal:modal, lightbox:lightbox, qImages:qImages, item:item };
})();
