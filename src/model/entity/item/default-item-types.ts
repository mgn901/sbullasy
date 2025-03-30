import { type ItemType, type ItemTypeName, itemTypeTypeSymbol } from './item-type.ts';

export const itemTypeNames = {
  subject: 'subject' as ItemTypeName,
  classHour: 'class-hour' as ItemTypeName,
  teacher: 'teacher' as ItemTypeName,
  course: 'course' as ItemTypeName,
  place: 'place' as ItemTypeName,
  event: 'event' as ItemTypeName,
  post: 'post' as ItemTypeName,
} as const;

export const sbullasyDefaultItemTypes = {
  /** 科目 */
  [itemTypeNames.subject]: {
    [itemTypeTypeSymbol]: itemTypeTypeSymbol,
    name: 'subject' as ItemTypeName,
    baseType: 'item',
    displayNameI18nMap: {
      ja: '科目',
      en: 'Subject',
    },
    schema: {
      /** 科目名ひらがな */
      nameHiragana: 'std:string',
      /** 科目コード */
      subjectCode: 'std:string',
      /** 科目分類コード（ナンバリング） */
      classification: 'std:string',
      /** クラス番号 */
      classNumber: 'std:string',
      /** URL */
      urls: 'std:string[]',
      /** 年度、学期、曜日、時限 */
      classHours: 'ref:classHour[]',
      /** 場所 */
      place: 'ref:place[]',
      /** 授業担当教員 */
      teachers: 'ref:teacher[]',
      /** 受講対象の履修区分 */
      courses: 'ref:course[]',
      /** 受講対象の学年 */
      grades: 'ref:grade[]',
      /** 教科書 */
      textbooks: 'std:string',
      /** 参考資料 */
      references: 'std:string',
      /** 成績評価の方法 */
      evaluationMethod: 'std:string',
    },
  },

  [itemTypeNames.classHour]: {
    [itemTypeTypeSymbol]: itemTypeTypeSymbol,
    name: 'class-hour' as ItemTypeName,
    displayNameI18nMap: {
      ja: '年度、学期、曜日、時限',
      en: 'Class Hour',
    },
    baseType: 'scheduledEvent',
    schema: {
      schoolYear: 'std:string',
      semester: 'std:string',
      semesterAbbreviation: 'std:string',
      dayOfWeek: 'std:string',
      period: 'std:string',
    },
  },

  [itemTypeNames.teacher]: {
    [itemTypeTypeSymbol]: itemTypeTypeSymbol,
    name: 'teacher' as ItemTypeName,
    displayNameI18nMap: {
      ja: '授業担当教員',
      en: 'Teacher',
    },
    baseType: 'item',
    schema: {
      nameHiragana: 'std:string',
    },
  },

  [itemTypeNames.course]: {
    [itemTypeTypeSymbol]: itemTypeTypeSymbol,
    name: 'course' as ItemTypeName,
    displayNameI18nMap: {
      ja: '履修区分',
      en: 'Course',
    },
    baseType: 'item',
    schema: {
      abbreviation: 'std:string',
    },
  },

  /** 場所 */
  [itemTypeNames.place]: {
    [itemTypeTypeSymbol]: itemTypeTypeSymbol,
    name: 'place' as ItemTypeName,
    displayNameI18nMap: {
      ja: '場所',
      en: 'Place',
    },
    baseType: 'item',
    schema: {
      abbreviation: 'std:string',
      textColor: 'std:string',
      backgroundColor: 'std:string',
      aliases: 'std:string[]',
    },
  },

  [itemTypeNames.event]: {
    [itemTypeTypeSymbol]: itemTypeTypeSymbol,
    name: 'event' as ItemTypeName,
    displayNameI18nMap: {
      ja: 'イベント',
      en: 'Event',
    },
    baseType: 'scheduledEvent',
    schema: {
      description: 'std:string',
    },
  },

  [itemTypeNames.post]: {
    [itemTypeTypeSymbol]: itemTypeTypeSymbol,
    name: 'post' as ItemTypeName,
    displayNameI18nMap: {
      ja: '投稿',
      en: 'Post',
    },
    baseType: 'item',
    schema: {
      body: 'std:string',
    },
  },
} as const satisfies Record<ItemTypeName, ItemType>;
