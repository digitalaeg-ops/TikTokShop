// โครงคำถามที่ฟอร์ม (wholesale / channels) และแดชบอร์ด (results) ใช้ร่วมกัน — เวอร์ชัน 2 ลิงก์ 4 กลุ่ม
// แก้ข้อความ/ตัวเลือกที่นี่ที่เดียว · id ทุกตัวเป็นคีย์ที่เก็บในฐานข้อมูล ห้ามเปลี่ยนหลังเริ่มเก็บข้อมูล
window.SURVEY = {
  year: 2569,
  nextYear: 2570,
  supabaseUrl: 'https://dwujywycnyvxyyqwunnf.supabase.co',
  // anon key เป็นคีย์สาธารณะ (ใช้ได้แค่ "ส่งคำตอบ" ตาม RLS) — อ่านผลต้องใช้รหัสผ่านฟังก์ชัน get_artwork_survey_v2_results
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dWp5d3ljbnl2eHl5cXd1bm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1ODQwNTksImV4cCI6MjEwMDE2MDA1OX0.RbTDMQmohZecSDTDSmB2fhlrfaowMmcd7RzTvECBgC0',
  table: 'artwork_survey_v2',
  rpc: 'get_artwork_survey_v2_results',

  months: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.'],
  monthsFull: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน'],

  links: {
    wholesale: { label: 'ลิงก์ 1 · ค้าส่ง', short: 'ลิงก์ 1', groups: ['wholesale'], path: '/wholesale', time: '5–6 นาที',
                 closeAt: '2026-11-25T23:59:59+07:00', closeText: 'วันที่ 25 พ.ย. 69 เวลา 23.59 น.' },
    channels:  { label: 'ลิงก์ 2 · Retail / MarketPlace / Website', short: 'ลิงก์ 2', groups: ['retail', 'marketplace', 'website'], path: '/channels', time: '6 นาที + 2–3 นาทีต่อกลุ่ม',
                 closeAt: '2026-11-20T23:59:59+07:00', closeText: 'วันที่ 20 พ.ย. 69 เวลา 23.59 น.' },
    all:       { label: 'ลิงก์ 3 · รวมทุกช่องทาง', short: 'ลิงก์ 3', groups: ['wholesale', 'retail', 'marketplace', 'website'], path: '/all', time: '6 นาที + 2–3 นาทีต่อกลุ่ม', requireAll: true }
  },

  roles: ['ผู้จัดการ / หัวหน้าทีม', 'พนักงานขาย / Sales', 'Admin / ประสานงาน'],
  freqs: ['ทุกสัปดาห์', 'ทุกเดือน', 'เฉพาะบางแคมเปญ', 'นาน ๆ ครั้ง'],
  scale: ['ต้องปรับปรุงมาก', 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก'],

  // แกนร่วม 5 ข้อ — ถ้อยคำเดียวกันทุกกลุ่ม ใช้เทียบข้ามกลุ่มในแดชบอร์ด
  core: [
    { id: 'attractive', label: 'ดึงดูดสายตา สวยงาม ทันสมัย' },
    { id: 'clarity',    label: 'สื่อสารโปรโมชั่นชัด (ราคา / เงื่อนไข / ระยะเวลา) เข้าใจได้เร็ว' },
    { id: 'brand',      label: 'สอดคล้องกับภาพลักษณ์แบรนด์ SANWA' },
    { id: 'ontime',     label: 'ได้รับงานทันเวลาใช้งาน' },
    { id: 'sales',      label: 'ช่วยกระตุ้นยอดขาย / การตอบสนองของลูกค้า' }
  ],

  // ชุดคำถามรายกลุ่ม · sp.type: rate (1–5) / choice (ตัวเลือก, text = ช่องให้พิมพ์เมื่อเลือกข้อนั้น) / text (พิมพ์ตอบ)
  // img: รูปประกอบคำถาม อ้างอิงรูปใน aw-data.js { g กลุ่ม, m เดือน, k ชุด, i ลำดับ (เริ่ม 0) }
  groups: {
    wholesale: {
      label: 'ค้าส่ง', short: 'ค้าส่ง', link: 'wholesale',
      intro: 'Artwork ค้าส่งเป็นขนาด A4 ทีม Sale ใช้ส่งต่อให้ร้านค้าและตัวแทนจำหน่าย',
      ch: [],
      sp: [
        { id: 'title_fit', type: 'rate', req: 1, label: 'ชื่อหัวข้อโปรโมชัน “ยิ่งซื้อยิ่งคุ้ม” ดึงดูดความสนใจและเหมาะสมกับโปรโมชันของลูกค้าตัวแทนจำหน่าย ระดับไหน', img: 'wholesaleTitle' },
        { id: 'rename', type: 'choice', req: 1, label: 'อยากเปลี่ยนชื่อโปรโมชัน “ยิ่งซื้อยิ่งคุ้ม” หรือไม่',
          opts: [{ v: 'ไม่เปลี่ยน' }, { v: 'เปลี่ยน', text: 'เสนอชื่อใหม่' }] },
        { id: 'festive', type: 'choice', req: 1, label: 'คุณมีความคิดเห็นกับการเปลี่ยน Artwork ตามธีมเทศกาลตลอดทั้งปี (เช่น ปีใหม่, ตรุษจีน, สงกรานต์, ฮาโลวีน ฯลฯ) อย่างไร',
          opts: [{ v: 'ไม่จำเป็นต้องมี ใช้สีแบรนด์ SANWA ก็เพียงพอ' }, { v: 'มีเหมือนเดิม ช่วยเพิ่มความสนใจ' }, { v: 'ไม่แน่ใจ' }] },
        { id: 'table_clear', type: 'rate', req: 1, label: 'ตารางซื้อ / แถม และเงื่อนไขขั้นต่ำ อ่านเข้าใจง่าย' },
        { id: 'ready_to_send', type: 'choice', req: 1, label: 'ทีม Sale ส่งต่อให้ร้านค้าได้ทันที ไม่ต้องแก้ไขเพิ่ม',
          opts: [{ v: 'ส่งได้ทันที' }, { v: 'ยังต้องนำมาแก้ไขเพิ่ม', text: 'ระบุสิ่งที่ต้องแก้ไข' }] },
        { id: 'a4_fit', type: 'rate', req: 1, label: 'ขนาด A4 เหมาะกับการใช้งาน (พิมพ์ / ส่งทาง LINE)' },
        { id: 'dealer_request', type: 'text', label: 'ฟีดแบ็กจากลูกค้าตัวแทนจำหน่าย: ขอ Artwork แบบไหนที่เรายังไม่มี', ph: 'เช่น อยากได้ตารางราคาแยกรุ่น / แคตตาล็อกสินค้าใหม่' }
      ]
    },
    retail: {
      label: 'Retail', short: 'Retail', link: 'channels',
      intro: 'Artwork Retail มี 2 รูปแบบ: A4 ที่ส่งให้ทีม Sale ใช้กับร้านค้าปลีก และ LINE card สำหรับ Broadcast ผ่าน LINE OA',
      ch: [
        { id: 'a4',   label: 'Artwork ขนาด A4 ที่ส่งให้ทีม Sale' },
        { id: 'line', label: 'LINE card Broadcast LINE OA' }
      ],
      sp: [
        { id: 'title_fit', type: 'rate', req: 1, label: 'ชื่อหัวข้อโปรโมชัน “ดีลสุดคุ้ม ลดทั้งเดือน” ดึงดูดความสนใจและเหมาะสมกับโปรโมชันของลูกค้าร้านค้าปลีก ระดับไหน', img: 'retailTitle' },
        { id: 'rename', type: 'choice', req: 1, label: 'อยากเปลี่ยนชื่อโปรโมชัน “ดีลสุดคุ้ม ลดทั้งเดือน” หรือไม่',
          opts: [{ v: 'ไม่เปลี่ยน' }, { v: 'เปลี่ยน', text: 'เสนอชื่อใหม่' }] },
        { id: 'festive', type: 'choice', req: 1, label: 'คุณมีความคิดเห็นกับการเปลี่ยน Artwork ตามธีมเทศกาลตลอดทั้งปี (เช่น ปีใหม่, ตรุษจีน, สงกรานต์, ฮาโลวีน ฯลฯ) อย่างไร',
          opts: [{ v: 'ไม่จำเป็นต้องมี ใช้สีแบรนด์ SANWA ก็เพียงพอ' }, { v: 'มีเหมือนเดิม ช่วยเพิ่มความสนใจ' }, { v: 'ไม่แน่ใจ' }] },
        { id: 'minbuy_clear', type: 'rate', req: 1, label: 'ยอดซื้อขั้นต่ำและของแถมเห็นชัดในแวบแรก' },
        { id: 'line_readable', type: 'rate', req: 1, label: 'LINE card อ่านชัดบนจอมือถือ และชวนให้กดดูต่อ' },
        { id: 'broadcast_time', type: 'choice', req: 1, label: 'วันเวลาบรอดแคสต์ “ทุกวันอังคาร 11.00 น.” เหมาะสมหรือไม่',
          opts: [{ v: 'เหมาะสม' }, { v: 'ควรเปลี่ยน', text: 'วัน / เวลาที่เสนอ' }] },
        { id: 'set_clear', type: 'rate', req: 1, label: 'โปรโมชันแยกแต่ละชุด (ชุด 1 / 2 / 3) ได้ชัด ไม่สับสน' },
        { id: 'retail_confusion', type: 'text', label: 'ร้านค้าปลีกถามหรือสับสนเรื่องอะไรในโปรบ่อยที่สุด', ph: 'เช่น เงื่อนไขขั้นต่ำ ของแถม ระยะเวลาโปร' }
      ]
    },
    marketplace: {
      label: 'MarketPlace', short: 'MP', link: 'channels', pickLabel: 'MarketPlace (LAZADA  Shopee  TikTok Shop)',
      intro: 'Artwork MarketPlace คือ Banner หน้าร้านบน Shopee / Lazada / TikTok Shop',
      ch: [
        { id: 'shopee', label: 'Banner หน้าร้าน Shopee' },
        { id: 'lazada', label: 'Banner หน้าร้าน Lazada' },
        { id: 'tiktok', label: 'Banner หน้าร้าน TikTok Shop' }
      ],
      chNA: 'ไม่ได้ดูแล',
      sp: [
        { id: 'spec_fit', type: 'rate', req: 1, label: 'ขนาดรูปภาพแต่ละแพลตฟอร์ม ใช้ได้ทันทีไม่ต้องแก้ขนาด' },
        { id: 'mobile_readable', type: 'rate', req: 1, label: 'อ่านชัดบนจอมือถือ (ตัวหนังสือ / ราคา)' },
        { id: 'campaign_ontime', type: 'rate', req: 1, label: 'ทันวันแคมเปญ (เช่น 9.9, 11.11, Payday)' },
        { id: 'redesign', type: 'choice', req: 1, label: 'ปี 2570 อยากให้ออกแบบใหม่ หรือใช้รูปแบบคล้ายแบบเดิมปี 2569', img: 'mpStyle',
          opts: [{ v: 'ออกแบบใหม่', text: 'ระบุแนวทางที่อยากได้' }, { v: 'คล้ายแบบเดิม ปี 2569' }] },
        { id: 'competitor_ref', type: 'text', label: 'ตัวอย่าง Banner ของคู่แข่งหรือร้านอื่นที่อยากให้ทำตาม', ph: 'พิมพ์ชื่อร้าน หรือวางลิงก์' }
      ]
    },
    website: {
      label: 'Website', short: 'Web', link: 'channels',
      intro: 'Artwork Website คือ Banner บนเว็บไซต์ SANWA ต้องเด่นชัดทั้งบนคอมพิวเตอร์และมือถือ',
      ch: [],
      sp: [
        { id: 'readable', type: 'rate', req: 1, label: 'ข้อความบนแบนเนอร์และราคาอ่านชัดทั้งบนคอมพิวเตอร์และมือถือ' },
        { id: 'clickable', type: 'rate', req: 1, label: 'ชวนให้คลิกไปดูสินค้า / โปรโมชั่นต่อ' },
        { id: 'more_banner', type: 'text', label: 'หน้าเว็บส่วนไหนที่อยากให้มี Banner เพิ่ม', ph: 'เช่น หน้าหมวดสินค้า หน้าบทความ' }
      ]
    }
  },
  groupOrder: ['wholesale', 'retail', 'marketplace', 'website'],

  // รูปประกอบคำถาม (อ้างอิงรูปใน aw-data.js)
  questionImages: {
    wholesaleTitle: [{ g: 'wholesale', m: '01', k: 'a4', i: 0 }, { g: 'wholesale', m: '04', k: 'a4', i: 0 }, { g: 'wholesale', m: '07', k: 'a4', i: 0 }, { g: 'wholesale', m: '10', k: 'a4', i: 0 }],
    retailTitle: [{ g: 'retail', m: '01', k: 'a4', i: 0 }, { g: 'retail', m: '06', k: 'a4', i: 0 }, { g: 'retail', m: '09', k: 'a4', i: 0 }, { g: 'retail', m: '10', k: 'a4', i: 0 }],
    mpStyle: [{ g: 'marketplace', m: '02', k: 'shopee', i: 0 }, { g: 'marketplace', m: '03', k: 'shopee', i: 0 }, { g: 'marketplace', m: '05', k: 'shopee', i: 0 },
              { g: 'marketplace', m: '09', k: 'shopee', i: 0 }, { g: 'marketplace', m: '11', k: 'shopee', i: 0 }]
  },

  vsLastYear: ['ดีขึ้นมาก', 'ดีขึ้น', 'เท่าเดิม', 'แย่ลง', 'ไม่แน่ใจ / ไม่ได้ใช้ปีก่อน'],
  improve: [
    'ดีไซน์ทันสมัย น่าสนใจขึ้น',
    'ข้อความกระชับ ตัวอักษรใหญ่ อ่านง่าย',
    'เน้นราคา / ส่วนลดให้เด่น',
    'รูปสินค้าคมชัด สมจริง',
    'ทำหลายขนาดให้ครบทุกช่องทาง',
    'เพิ่มวิดีโอ / ภาพเคลื่อนไหว',
    'ส่งงานเร็วขึ้น / ได้รับล่วงหน้า',
    'แยกงานตามกลุ่มลูกค้า (ช่าง / ร้านค้า / ผู้บริโภค)',
    'มี Template ให้ทีมปรับแก้เองได้',
    'อื่น ๆ (ระบุในข้อเสนอแนะ)'
  ],
  improveMax: 3,
  fastFlagSec: 120,   // ตอบเสร็จเร็วกว่านี้ (วินาที) = ติดธง "ตอบเร็วผิดปกติ" ในแดชบอร์ด
  formats: [
    'โพสต์ภาพนิ่ง',
    'วิดีโอสั้น (Reels / TikTok)',
    'Carousel / อัลบั้มหลายภาพ',
    'Story (แนวตั้ง)',
    'Banner Marketplace',
    'แคตตาล็อกออนไลน์ / PDF',
    'ภาพสำหรับส่งใน LINE'
  ],
  leadTimes: ['1–3 วัน', '1 สัปดาห์', '2 สัปดาห์']
};
