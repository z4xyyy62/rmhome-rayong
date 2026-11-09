/**
 * ============================================================================
 * RM HOME RAYONG - Google Apps Script LINE Notification & Sheet Bridge
 * ============================================================================
 * โค้ดสำหรับวางใน Google Apps Script (extensions -> Apps Script)
 * ทำหน้าที่:
 * 1. รับข้อมูลลูกค้าที่กรอกแบบฟอร์มจากหน้าเว็บ RM HOME
 * 2. บันทึกลงตาราง Google Sheets อัตโนมัติ (เก็บ Lead ประวัติลูกค้า)
 * 3. ส่งข้อความแจ้งเตือน Flex Message ดีไซน์หรูหราเข้า LINE ของทีมงาน/กลุ่มแอดมินทันที
 *    พร้อมปุ่มคลิกโทรออกหาลูกค้าได้ทันที
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// ⚙️ 1. การตั้งค่าระบบ (Configuration)
// ----------------------------------------------------------------------------
// ใส่ Channel Access Token จาก LINE Developers Console (Messaging API)
const LINE_CHANNEL_ACCESS_TOKEN = 'YOUR_LINE_CHANNEL_ACCESS_TOKEN_HERE';

// ใส่ Group ID (ขึ้นต้นด้วย C...) หรือ User ID (ขึ้นต้นด้วย U...) ของแอดมิน
// หากต้องการส่งแบบ Broadcast เข้า LINE OA ของทุกคนที่ติดตาม ให้ใส่ 'BROADCAST'
const TARGET_LINE_ID = 'BROADCAST'; // หรือ 'Cxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

// ชื่อชีตที่จะใช้เก็บข้อมูล
const SHEET_NAME = 'Leads_ลูกค้าติดต่อ';

// ----------------------------------------------------------------------------
// 🚀 2. ฟังก์ชันรับข้อมูลจากหน้าเว็บ (POST Request)
// ----------------------------------------------------------------------------
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const lead = {
      name: data.name || 'ไม่ระบุชื่อ',
      phone: data.phone || 'ไม่ระบุเบอร์โทร',
      location: data.location || 'ไม่ระบุทำเล',
      budget: data.budget || 'ตามประเมินหน้างาน',
      message: data.message || 'สนใจสร้างบ้านกับ RMHome',
      time: data.time || Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss'),
      isTest: data.isTest === true || data.isTest === 'true'
    };

    // 1. บันทึกลง Google Sheets
    appendLeadToSheet(lead);

    // 2. ส่งข้อความแจ้งเตือนเข้า LINE
    if (LINE_CHANNEL_ACCESS_TOKEN && LINE_CHANNEL_ACCESS_TOKEN !== 'YOUR_LINE_CHANNEL_ACCESS_TOKEN_HERE') {
      sendLineNotification(lead);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'บันทึกข้อมูลและส่งแจ้งเตือน LINE สำเร็จ',
      data: lead
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------------------------------------------------------------------
// 🔍 3. ฟังก์ชันทดสอบการทำงานผ่านบราวเซอร์ (GET Request)
// ----------------------------------------------------------------------------
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    service: 'RM HOME Rayong - LINE Webhook Service',
    time: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'dd/MM/yyyy HH:mm:ss')
  })).setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------------
// 📊 4. บันทึกข้อมูลลง Google Sheet
// ----------------------------------------------------------------------------
function appendLeadToSheet(lead) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // สร้าง Header คอลัมน์
      sheet.appendRow([
        'วัน-เวลาที่ติดต่อ',
        'ชื่อลูกค้า',
        'เบอร์โทรศัพท์',
        'ทำเลที่ดิน / อำเภอ',
        'งบประมาณที่วางไว้',
        'รายละเอียดเพิ่มเติม',
        'สถานะการติดต่อ',
        'หมายเหตุ'
      ]);
      
      // จัดรูปแบบหัวตาราง
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setBackground('#0e3d29');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // เพิ่มแถวข้อมูลลูกค้า
    sheet.appendRow([
      lead.time,
      lead.name,
      lead.phone,
      lead.location,
      lead.budget,
      lead.message,
      lead.isTest ? 'ทดสอบระบบ' : 'ลูกค้าใหม่ (รอติดต่อกลับ)',
      lead.isTest ? 'ยิงทดสอบจาก Dashboard' : 'ส่งจากฟอร์มหน้าเว็บไซต์'
    ]);

  } catch (err) {
    Logger.log('Error writing to sheet: ' + err.toString());
  }
}

// ----------------------------------------------------------------------------
// 🔔 5. ส่งข้อความแจ้งเตือน Flex Message เข้า LINE
// ----------------------------------------------------------------------------
function sendLineNotification(lead) {
  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  const telUrl = cleanPhone ? 'tel:' + cleanPhone : 'https://z4xyyy62.github.io/rmhome-rayong/';
  const badgeTitle = lead.isTest ? '🧪 ทดสอบระบบแจ้งเตือน LINE' : '🔔 มีลูกค้าติดต่อสร้างบ้านใหม่!';

  // โครงสร้าง Flex Message สไตล์หรูหรา Dark Emerald & Gold
  const flexPayload = {
    type: 'flex',
    altText: badgeTitle + ' คุณ ' + lead.name + ' (' + lead.phone + ')',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0c262c',
        paddingAll: '18px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            alignItems: 'center',
            contents: [
              {
                type: 'text',
                text: '🏗️ RM HOME RAYONG',
                weight: 'bold',
                color: '#d4af37',
                size: 'xs',
                flex: 1
              },
              {
                type: 'text',
                text: lead.isTest ? 'TEST' : 'NEW LEAD',
                weight: 'bold',
                color: lead.isTest ? '#38bdf8' : '#22c55e',
                size: 'xxs',
                align: 'end'
              }
            ]
          },
          {
            type: 'text',
            text: badgeTitle,
            weight: 'bold',
            color: '#ffffff',
            size: 'md',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#ffffff',
        paddingAll: '18px',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '👤 ชื่อลูกค้า:', color: '#64748b', size: 'sm', flex: 3 },
              { type: 'text', text: lead.name, weight: 'bold', color: '#0f172a', size: 'sm', flex: 7, wrap: true }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '📞 เบอร์โทร:', color: '#64748b', size: 'sm', flex: 3 },
              { type: 'text', text: lead.phone, weight: 'bold', color: '#0e3d29', size: 'sm', flex: 7 }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '📍 ทำเลที่ดิน:', color: '#64748b', size: 'sm', flex: 3 },
              { type: 'text', text: lead.location, color: '#334155', size: 'sm', flex: 7, wrap: true }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '💰 งบประมาณ:', color: '#64748b', size: 'sm', flex: 3 },
              { type: 'text', text: lead.budget, weight: 'bold', color: '#b45309', size: 'sm', flex: 7 }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'sm',
            paddingAll: '10px',
            backgroundColor: '#f8fafc',
            cornerRadius: '8px',
            contents: [
              { type: 'text', text: '💬 ความต้องการ:', color: '#64748b', size: 'xs', weight: 'bold' },
              { type: 'text', text: lead.message, color: '#1e293b', size: 'sm', wrap: true, margin: 'xs' }
            ]
          },
          {
            type: 'text',
            text: '⏰ ' + lead.time,
            color: '#94a3b8',
            size: 'xxs',
            align: 'end',
            margin: 'sm'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#f1f5f9',
        paddingAll: '14px',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '📞 โทรหาลูกค้าทันที',
              uri: telUrl
            },
            style: 'primary',
            color: '#0e3d29',
            height: 'sm'
          },
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '📊 เข้าแดชบอร์ด RM HOME',
              uri: 'https://z4xyyy62.github.io/rmhome-rayong/admin.html'
            },
            style: 'secondary',
            height: 'sm'
          }
        ]
      }
    }
  };

  // เลือกว่าจะส่งแบบ Broadcast หรือ Push เข้ากลุ่ม/ผู้ใช้เฉพาะ
  let apiUrl = 'https://api.line.me/v2/bot/message/broadcast';
  let requestBody = { messages: [flexPayload] };

  if (TARGET_LINE_ID && TARGET_LINE_ID !== 'BROADCAST') {
    apiUrl = 'https://api.line.me/v2/bot/message/push';
    requestBody = {
      to: TARGET_LINE_ID,
      messages: [flexPayload]
    };
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    Logger.log('LINE Response: ' + response.getContentText());
  } catch (e) {
    Logger.log('LINE Error: ' + e.toString());
  }
}

