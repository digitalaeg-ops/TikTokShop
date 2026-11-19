// โครงคำถามที่ฟอร์ม (index.html) และแดชบอร์ด (results.html) ใช้ร่วมกัน
// แก้ข้อความ/ตัวเลือกที่นี่ที่เดียว — id ของช่องทางและหัวข้อคะแนนเป็นคีย์ที่เก็บในฐานข้อมูล ห้ามเปลี่ยนหลังเริ่มเก็บข้อมูล
window.SURVEY = {
  year: 2569,
  nextYear: 2570,
  supabaseUrl: 'https://dwujywycnyvxyyqwunnf.supabase.co',
  // anon key เป็นคีย์สาธารณะ (ใช้ได้แค่ "ส่งคำตอบ" ตาม RLS) — อ่านผลต้องใช้รหัสผ่านฟังก์ชัน get_artwork_survey_results
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWp5d3ljbnl2eHl5cXd1bm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1ODQwNTksImV4cCI6MjEwMDE2MDA1OX0.RbTDMQmohZecSDTDSmB2fhlrfaowMmcd7RzTvECBgC0',
  table: 'artwork_survey_responses',

  teams: ['ค้าส่ง', 'Retail', 'MarketPlace'],
  roles: ['ผู้จัดการ / หัวหน้าทีม', 'พนักงานขาย / Sales', 'Admin / ประสานงาน', 'การตลาด / คอนเทนต์', 'อื่น ๆ'],
  freqs: ['ทุกสัปดาห์', 'ทุกเดือน', 'เฉพาะบางแคมเปญ', 'นาน ๆ ครั้ง'],

  channels: [
    { id: 'facebook',    label: 'Facebook' },
    { id: 'line',        label: 'LINE OA / กลุ่ม LINE' },
    { id: 'tiktok',      label: 'TikTok' },
    { id: 'marketplace', label: 'Shopee / Lazada / TikTok Shop' },
    { id: 'website',     label: 'เว็บไซต์' },
    { id: 'pop',         label: 'สื่อ ณ จุดขาย (POP / โปสเตอร์ / ป้าย)' },
    { id: 'print',       label: 'แคตตาล็อก / โบรชัวร์ / สิ่งพิมพ์' },
    { id: 'dealer',      label: 'ไฟล์ส่งต่อให้ร้านค้า / ดีลเลอร์' }
  ],

  criteria: [
    { id: 'attractive', label: 'ดึงดูดสายตา สวยงาม ทันสมัย' },
    { id: 'clarity',    label: 'สื่อสารโปรโมชั่นชัด (ราคา / เงื่อนไข / ระยะเวลา) อ่านเข้าใจเร็ว' },
    { id: 'target',     label: 'ตรงกับกลุ่มลูกค้าของทีม' },
    { id: 'format',     label: 'ขนาด / รูปแบบเหมาะกับแต่ละช่องทาง' },
    { id: 'brand',      label: 'สอดคล้องกับภาพลักษณ์แบรนด์ SANWA' },
    { id: 'ontime',     label: 'ได้รับงานทันเวลาใช้งาน' },
    { id: 'variety',    label: 'จำนวนและความหลากหลายของงานเพียงพอ' },
    { id: 'sales',      label: 'ช่วยกระตุ้นยอดขาย / การตอบสนองของลูกค้า' }
  ],

  scale: ['ต้องปรับปรุงมาก', 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก'],
  vsLastYear: ['ดีขึ้นมาก', 'ดีขึ้น', 'เท่าเดิม', 'แย่ลง', 'ไม่แน่ใจ / ไม่ได้ใช้ปีก่อน'],

  improve: [
    'ดีไซน์ทันสมัย น่าสนใจขึ้น',
    'ข้อความกระชับ ตัวอักษรใหญ่ อ่านง่าย',
    'เน้นราคา / ส่วนลดให้เด่นชัด',
    'รูปสินค้าคมชัด สมจริง',
    'ทำหลายขนาดให้ครบทุกช่องทาง',
    'เพิ่มวิดีโอ / ภาพเคลื่อนไหว',
    'ส่งงานเร็วขึ้น / ได้รับล่วงหน้า',
    'แยกงานตามกลุ่มลูกค้า (ช่าง / ร้านค้า / ผู้บริโภค)',
    'มี Template ให้ทีมปรับแก้เองได้',
    'อื่น ๆ (ระบุในข้อเสนอแนะ)'
  ],
  improveMax: 3,

  formats: [
    'โพสต์ภาพนิ่ง',
    'วิดีโอสั้น (Reels / TikTok)',
    'Carousel / อัลบั้มหลายภาพ',
    'Story (แนวตั้ง)',
    'Banner Marketplace',
    'สื่อสิ่งพิมพ์ ณ จุดขาย (POP)',
    'แคตตาล็อกออนไลน์ / PDF',
    'ภาพสำหรับส่งใน LINE'
  ],

  leadTimes: ['1 สัปดาห์', '2 สัปดาห์', '3–4 สัปดาห์', 'มากกว่า 1 เดือน']
};
