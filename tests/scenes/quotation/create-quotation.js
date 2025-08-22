import { check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

import { testCreateQuotation } from '../../apis/quotation/quotation-save.js';

function generateQuotationData() {
  const testNumber = Math.floor(Math.random() * 10000);
  const datetimeUTC = new Date().toISOString();

  return {
    quotationMode: 'SINGLE',
    class: 'FR',
    subclass: 'FR',
    risks: [
      {
        id: '2c7c75f4-3629-4a20-848f-0a93b77f98ff',
        riskCode: '1032',
        riskDescription: 'บ้านอยู่อาศัย (1032)',
        appForm: 'HOUSE'
      }
    ],
    appForm: 'HOUSE',
    insureds: [
      {
        insuredType: 'P',
        titleId: '1124a9c9-9963-4466-a76b-be585921c38d',
        titleName: 'นาย',
        firstName: `load-test-${testNumber}-${datetimeUTC}`,
        lastName: `test-${testNumber}-${datetimeUTC}`,
        address: {
          province: {
            id: '018f9700-1111-4111-8111-1b3a7f7a8c01',
            name: 'กรุงเทพมหานคร',
            iiaId: 209
          },
          amphur: { id: '8410ea2f-f7ca-4971-aacf-4770b68da701', name: 'คลองเตย', iiaId: 25 },
          district: {
            id: '75a212cb-bbf1-47c0-bc6f-28f5d6c4f050',
            name: 'คลองตัน',
            iiaId: 558
          },
          postcode: '10110',
          houseNumber: '1',
          addressLine: '2',
          moo: '3',
          soi: '4',
          road: '5'
        }
      }
    ],
    addresses: [
      {
        province: {
          id: '018f9700-1111-4111-8111-1b3a7f7a8c01',
          name: 'กรุงเทพมหานคร',
          iiaId: 209
        },
        amphur: { id: '8410ea2f-f7ca-4971-aacf-4770b68da701', name: 'คลองเตย', iiaId: 25 },
        district: { id: '75a212cb-bbf1-47c0-bc6f-28f5d6c4f050', name: 'คลองตัน', iiaId: 558 },
        postcode: '10110',
        houseNumber: '1',
        addressLine: '2',
        moo: '3',
        soi: '4',
        road: '5',
        buildings: [
          {
            name: 'อาคารสิ่งปลูกสร้าง',
            basicCoverages: [
              {
                basicCoverageId: '508e0d42-cdb7-4649-a0c8-01e19dc5d8b9',
                name: 'มูลค่าอาคารสิ่งปลูกสร้าง (ไม่รวมฐานราก)',
                helpText: 'สิ่งปลูกสร้าง (ไม่รวมฐานราก) รวมส่วนปรับปรุงต่อเติม',
                orderNo: 1
              },
              {
                basicCoverageId: 'd307ddb3-4116-425b-b777-3dd96f9fae77',
                name: 'มูลค่าเฟอร์นิเจอร์ (หรือทรัพย์สินภายในสิ่งปลูกสร้าง หากไม่สามารถจำแนกได้)',
                helpText: 'เฟอร์นิเจอร์ สิ่งตกแต่งติดตั้งตรึงตราต่าง ๆ',
                orderNo: 2
              },
              {
                basicCoverageId: '61e1f068-52d7-4959-88a2-de4409e1cb1a',
                name: 'มูลค่าอุปกรณ์ไฟฟ้า',
                helpText: 'อุปกรณ์เครื่องใช้ไฟฟ้า',
                orderNo: 3
              },
              {
                basicCoverageId: '97f673f7-cd4c-4f35-9a82-b3701502e8bf',
                name: 'มูลค่าแผงโซล่าเซลล์',
                helpText:
                  'แผงโซล่าเซลล์ และระบบต่าง ๆ ที่เกี่ยวข้องกับระบบผลิตกระแสไฟฟ้าจากแสงอาทิตย์',
                orderNo: 4
              }
            ],
            surchargeQuestions: [
              {
                surchargeQuestionId: 'dd19b75f-f611-49ac-8ecc-4294a925371d',
                question: 'ที่อยู่อาศัยเป็นบ้านเดี่ยวหรือไม่'
              }
            ],
            extinguishes: [
              {
                extinguishId: 'e88b2110-91b2-4e57-9b65-f22c8f0227eb',
                name: 'มีอุปกรณ์ดับเพลิงหรือไม่ ?',
                orderNo: 1
              }
            ],
            orderNo: 1
          }
        ],
        orderNo: 1
      }
    ],
    absorbMethodId: '1',
    absorbTypeName: 'ปกติ',
    ae: {
      id: '15f53198-73a5-48b8-baeb-2069c2f2d94e',
      firstname: 'AEบอย',
      lastname: 'สุวรรณรัตน์',
      profileId: '018f95c6-1b3a-7f7a-8b1a-1b3a7f7a9002',
      email: 'sirintra.s@beryl8.com'
    },
    isTax: true,
    commissionPlanId: '352bfbf9-f3b9-4865-805c-f2b827c242ba',
    commissionPlanName: 'ค่ายดาวรุ่ง',
    agentBrokers: [],
    addonCoverages: [
      {
        addonCoverageId: '3e4d018f-511f-4171-ae1b-8ee58b7436bc',
        name: 'ภัยลมพายุ',
        orderNo: 1
      },
      {
        addonCoverageId: '8e85bc22-5939-40a8-be21-0180caf987fc',
        name: 'ภัยน้ำท่วม',
        orderNo: 2
      },
      {
        addonCoverageId: 'b60d6979-cb2c-4a05-8c84-9109b8ed4a25',
        name: 'ภัยแผ่นดินไหวหรือภูเขาไฟระเบิด คลื่นใต้น้ำหรือสึนามิ',
        orderNo: 3
      },
      {
        addonCoverageId: 'b4430b6f-69ed-45cd-8d2f-910d6619dbb2',
        name: 'ภัยลูกเห็บ',
        orderNo: 4
      },
      {
        addonCoverageId: '4c48a88d-96a3-4b77-94b6-530231d8c2fc',
        name: 'ภัยจลาจลฯ',
        orderNo: 5
      },
      {
        addonCoverageId: '5706f64d-06ae-48af-a382-4e27e5db1cfc',
        name: 'ภัยต่อเครื่องไฟฟ้า (กรณีไฟฟ้าลัดวงจร)',
        orderNo: 6
      },
      {
        addonCoverageId: 'ba6a6bdf-ec76-4099-9f40-2cc633df0188',
        name: 'ภัยจากควัน (จากเครื่องทำความร้อนและชุดเครื่องอุปกรณ์ที่ใช้ประกอบอาหาร)',
        orderNo: 7
      }
    ],
    standardCoverages: [
      {
        standardCoverageId: '7c2b3bbd-7b49-47d8-8438-0e9a13737012',
        name: 'ไฟไหม้',
        orderNo: 1
      },
      {
        standardCoverageId: '3f607c41-fe9b-405b-affc-ca28cabc07b7',
        name: 'ฟ้าผ่า',
        orderNo: 2
      },
      {
        standardCoverageId: '582e1092-cdb1-4384-9f7d-7072a91f46ee',
        name: 'ระเบิด',
        orderNo: 3
      },
      {
        standardCoverageId: '8ae5523b-5633-4f0d-83da-08fe855bff1c',
        name: 'ภัยจากการเฉี่ยวและหรือการชนของยวดยานพาหนะ',
        orderNo: 4
      },
      {
        standardCoverageId: 'b4f72967-c3fe-4311-9cce-45966032d298',
        name: 'ภัยจากอากาศยานหรือวัตถุที่ตกจากอากาศยาน',
        orderNo: 5
      },
      {
        standardCoverageId: 'a2162681-d810-4328-a7c1-86dc5a4f5d47',
        name: 'ภัยเนื่องจากน้ำ (ไม่รวมน้ำท่วม)',
        orderNo: 6
      },
      {
        standardCoverageId: 'b03591e8-b6df-4704-9cb2-47c12033f492',
        name: 'กลุ่มภัยธรรมชาติ (ภัยจากลมพายุ, ภัยจากน้ำท่วม, ภัยจากแผ่นดินไหว หรือภูเขาไฟระเบิด หรือคลื่นใต้น้ำ หรือสึนามิ และภัยจากลูกเห็บ)',
        orderNo: 7
      }
    ],
    coveragesPeriod: {},
    beneficiaryDetails: [
      {
        beneficiaryType: '0',
        titleId: '1124a9c9-9963-4466-a76b-be585921c38d',
        titleName: 'นาย',
        firstName: `load-test-${testNumber}-${datetimeUTC}`,
        lastName: `test-${testNumber}-${datetimeUTC}`,
        amountValue: 0,
        orderNo: 1
      }
    ],
    discount: {
      marketingAmount: 0,
      marketingPercent: 0,
      marketingUnit: 'percent',
      commissionAmount: 0,
      commissionPercent: 0,
      commissionUnit: 'percent'
    }
  };
}

const createQuotationErrors = new Rate('create_quotation_errors');
const createQuotationResponseTime = new Trend('create_quotation_response_time');
const createQuotationRequests = new Counter('create_quotation_requests');

export function testCreateQuotationScene(baseUrl, headers) {
  const startTime = new Date().getTime();

  const quotationData = generateQuotationData();
  const result = testCreateQuotation(baseUrl, headers, quotationData);

  const endTime = new Date().getTime();
  const totalDuration = endTime - startTime;

  const success = check(
    { totalDuration, result },
    {
      'create quotation API successful': () => result.success,
      'create quotation load time < 3s': () => totalDuration < 3000,
      'create quotation load time < 2s': () => totalDuration < 2000,
      'response has quotationRequestId': () => {
        try {
          const data = JSON.parse(result.response.body);
          return data && data.data && data.data.quotationRequestId;
        } catch (e) {
          return false;
        }
      },
      'response has quotationVersionId': () => {
        try {
          const data = JSON.parse(result.response.body);
          return data && data.data && data.data.quotationVersionId;
        } catch (e) {
          return false;
        }
      },
      'response message is success': () => {
        try {
          const data = JSON.parse(result.response.body);
          return data && data.message === 'Quotation request created successfully';
        } catch (e) {
          return false;
        }
      },
      'response error is false': () => {
        try {
          const data = JSON.parse(result.response.body);
          return data && data.error === false;
        } catch (e) {
          return false;
        }
      }
    }
  );

  createQuotationErrors.add(!success);
  createQuotationResponseTime.add(totalDuration);
  createQuotationRequests.add(1);

  return {
    success: success && result.success,
    results: result,
    duration: totalDuration,
    totalDuration
  };
}
