const SECTIONS = {
  levels: "ระดับโรงพยาบาล",
  register: "ลงทะเบียนใช้ทุน",
  timeline: "ช่วงเวลารับสมัคร",
  eligibility: "สิทธิ์เรียนต่อเฉพาะทาง",
  university: "ม.รัฐ กับ ม.เอกชน",
  fixward: "Fix Ward กับใช้ทุนปกติ",
  scholarship: "ประเภททุน",
  sources: "แหล่งข้อมูล",
} as const;

const LEVELS = [
  ["รพ.สต.", "โรงพยาบาลส่งเสริมสุขภาพตำบล", "ปฐมภูมิ (พื้นฐาน)", "หน่วยบริการในชุมชน ให้บริการพื้นฐานและส่งเสริมสุขภาพ"],
  ["รพช.", "โรงพยาบาลชุมชน", "ทุติยภูมิ (ปานกลาง)", "หลักในระดับอำเภอ/จังหวัด (10–150 เตียง)"],
  ["รพท.", "โรงพยาบาลทั่วไป", "ทุติยภูมิขั้นสูง", "หลักในจังหวัดใหญ่ ศูนย์รับส่งต่อ (150–500 เตียง)"],
  ["รพศ.", "โรงพยาบาลศูนย์", "ตติยภูมิ (สูงและซับซ้อน)", "ศูนย์กลางเฉพาะทางของเขตสุขภาพ (500+ เตียง)"],
  ["สถ.", "สถาบัน", "ตติยภูมิพิเศษ (สูงที่สุด)", "ศูนย์เชี่ยวชาญเฉพาะด้านระดับประเทศ"],
];

// Read off a graphic, so months are approximate.
const TIMELINE = [
  ["เม.ย. – ส.ค.", "พชท. Fix Ward (มช., มข., มอ.)"],
  ["มิ.ย. – ธ.ค.", "Preclinic / Med Ed"],
  ["ก.ค. – ส.ค.", "กรมแพทย์ทหารเรือ"],
  ["ก.ค. – ก.ย.", "โครงการพัฒนาอาจารย์แพทย์ (รามาธิบดี)"],
  ["ก.ค. – ก.พ.", "พชท. อื่น ๆ"],
  ["ส.ค. – ม.ค.", "พชท. Fix Ward (มธ., มศว, พระนั่งเกล้าฯ, ชลประทาน)"],
  ["ก.ย. – พ.ย.", "แพทย์พี่เลี้ยง (CPIRD) รอบที่ 1"],
  ["พ.ย. – ม.ค.", "กรมแพทย์ทหารอากาศ"],
  ["ม.ค. – มี.ค.", "ฝึกอบรมเฉพาะทางเวชศาสตร์ครอบครัว (สำนักงานสนับสนุนระบบปฐมภูมิ)"],
  ["พ.ค.", "จับฉลาก (สธ.)"],
];

const FM = "เวชศาสตร์ครอบครัว";
const EM = "เวชศาสตร์ฉุกเฉิน";
const NS = "ประสาทศัลยศาสตร์";
const PM = "เวชศาสตร์ป้องกัน 10 แขนง";
const SX = "ศัลยศาสตร์";
const CP = "พยาธิวิทยาคลินิก";
const AP = "พยาธิวิทยากายวิภาค";
const PSY = "จิตเวชศาสตร์";
const CPSY = "จิตเวชศาสตร์เด็กและวัยรุ่น";
const ALL = "เรียนได้ทุกสาขา";
const ALL_BUT_TWO = "เรียนได้ทุกสาขาตามประกาศแพทยสภา ยกเว้นตจวิทยาและศัลยศาสตร์ตกแต่ง (ต้อง 3 ปี)";
const list = (count: number, ...names: string[]) => `${count} สาขา: ${names.join(", ")}`;

/** [years served, normal area, special-promotion area] */
const ELIGIBILITY: { who: string; rows: [string, string, string][] }[] = [
  {
    who: "1. แพทย์ทั่วไป",
    rows: [
      ["ไม่น้อยกว่า 1 ปี", list(13, FM, EM, NS, PM), list(13, FM, EM, NS, PM)],
      ["ไม่น้อยกว่า 2 ปี", "21 สาขา ตามประกาศ", ALL_BUT_TWO],
      ["ครบ 3 ปี", ALL, ALL],
    ],
  },
  {
    who: "2. แพทย์ CPIRD (ตามเงื่อนไข CPIRD)",
    rows: [
      ["ไม่น้อยกว่า 1 ปี", list(3, FM, EM, NS), list(3, FM, EM, NS)],
      ["ไม่น้อยกว่า 2 ปี", list(18, FM, EM, SX, NS, CP, AP, PSY, CPSY, PM), ALL_BUT_TWO],
      ["ครบ 3 ปี", ALL, ALL],
    ],
  },
  {
    who: "3. แพทย์ ODOD (ตามเงื่อนไข ODOD)",
    rows: [
      ["ไม่น้อยกว่า 1 ปี", list(1, EM), list(1, EM)],
      ["ไม่น้อยกว่า 2 ปี", list(2, FM, EM), list(2, FM, EM)],
      [
        "ไม่น้อยกว่า 3 ปี",
        list(15, FM, EM, SX, CP, AP, PM),
        `${list(25, FM, EM, SX, NS, CP, AP, "อายุรศาสตร์", "กุมารเวชศาสตร์", "สูติศาสตร์และนรีเวชวิทยา", "ออร์โธปิดิกส์", "วิสัญญีวิทยา", "เวชศาสตร์ฟื้นฟู", PSY, CPSY, "นิติเวชศาสตร์", PM)} (สาขา 4 ปีลดเหลือ 3 ปี เพิ่มอีก 10 สาขา)`,
      ],
      ["ครบ 6 ปี", ALL, ALL],
    ],
  },
  {
    who: "4 และ 6. ข้าราชการ สป.สธ. ที่ลาศึกษาแพทย์เพิ่มเติม, แพทย์โอนจากนอก สธ., บรรจุใหม่ และบรรจุกลับ",
    rows: [
      ["ไม่น้อยกว่า 1 ปี", list(2, FM, EM), list(2, FM, EM)],
      ["ไม่น้อยกว่า 2 ปี", list(17, FM, EM, SX, CP, AP, PSY, CPSY, PM), ALL_BUT_TWO],
      ["ไม่น้อยกว่า 3 ปี", ALL, ALL],
    ],
  },
];

const UNIVERSITY = [
  [
    "การเลือกโรงพยาบาล Intern",
    "กสพท: จับสลากรอบแรกร่วมกับเพื่อนทั่วประเทศ จึงมีโอกาสได้ รพศ./รพท. หรือใกล้บ้านมากกว่า CPIRD: ล็อกโควตา รพ. ในจังหวัดหรือเขตสุขภาพบ้านเกิดตั้งแต่แรก ไม่ต้องแย่งจับสลาก",
    "ไม่มีสิทธิ์จับสลากรอบแรก ต้องสมัครรอบเก็บตก คัดจากคะแนน NL สัมภาษณ์ และ Portfolio จึงกดดันเรื่องคะแนนสอบมากกว่า รพ.ใหญ่อาจถูกเลือกไปก่อนแล้ว แม้รายชื่อ รพ. ของรอบเอกชนอาจดูดีหรือใกล้กว่า และมีค่าใช้จ่าย 150,000 บาทในการเป็น Intern 1",
  ],
  [
    "สถานะการบรรจุ",
    "บรรจุเป็นข้าราชการตั้งแต่ปีแรกของการเพิ่มพูนทักษะ",
    "ปีแรกใน รพ.รัฐ เป็นลูกจ้างชั่วคราวหรือ พกส. จึงเสียอายุราชการและสวัสดิการข้าราชการไป 1 ปี",
  ],
  [
    "เรียนต่อเฉพาะทาง",
    "ขอทุนต้นสังกัดจาก รพ.จังหวัดได้ง่าย โรงเรียนแพทย์ส่วนใหญ่ให้โควตาผู้มีต้นสังกัดประมาณ 70–80%",
    "ถ้าหาต้นสังกัดไม่ได้ ต้องสมัครแบบแพทย์อิสระ (Free Train) ซึ่งมีโควตาประมาณ 20–30% บางสาขา เช่น ผิวหนัง จักษุ ศัลยกรรมตกแต่ง แทบไม่รับ หรืออาจต้องทำงานชดใช้ในระบบราชการนานกว่าจึงมีสิทธิ์สมัคร",
  ],
  [
    "คอนเนกชัน",
    "มีเครือข่ายรุ่นพี่รุ่นน้อง ซึ่งมีผลในการสัมภาษณ์เรียนต่อ",
    "อาจารย์เก่งและมาจาก ม.รัฐ แต่เครือข่าย รพ.ภูมิภาคส่วนใหญ่เป็นศิษย์เก่า ม.รัฐ และ CPIRD",
  ],
];

const FIX_WARD = [
  {
    title: "Fix Ward (1+3 ปี)",
    pros: [
      "ความรู้ยังแน่น เรียนต่อได้ทันที",
      "ทุ่มเทกับสาขาที่ชอบได้เลย",
      "ได้รายได้แบบแพทย์เฉพาะทางเร็วกว่า",
      "ถ้าไม่ได้ขอทุนเขตสุขภาพ จบแล้วไม่ต้องกลับไปใช้ทุน (Free Train) ทำงานที่ไหนก็ได้",
    ],
    cons: [
      "ขาดประสบการณ์ รพ.ชุมชน อาจมองภาพระบบสาธารณสุขและการ Refer ไม่ออก",
      "มั่นใจกับเคสทั่วไปน้อยกว่า",
      "กดดันสูง และถ้าพบว่าไม่ใช่สาขาที่ชอบ จะเปลี่ยนสายยาก",
    ],
  },
  {
    title: "ใช้ทุนปกติ + เรียนต่อ (3+3 ปี)",
    pros: [
      "ชั่วโมงบินสูง แก้ปัญหาเฉพาะหน้าและตัดสินใจได้ดี",
      "รู้จักเครือข่ายหมอต่าง รพ. และ สสจ.",
      "มีเวลาทบทวนว่าชอบสาขาไหน และมักมีเงินเก็บมากกว่า",
    ],
    cons: [
      "ห่างตำรา 2–3 ปี กลับมาเรียนต่อต้องปรับตัวมาก",
      "เสี่ยง Burnout ในบางโรงพยาบาลที่งานหนัก",
      "ส่วนใหญ่ต้องขอทุน เรียนจบต้องกลับไปใช้ทุนในเขตสุขภาพนั้นตามเวลาที่เรียน",
    ],
  },
];

const SCHOLARSHIPS = [
  {
    title: "ทุนนโยบายพิเศษ",
    points: [
      "สาขาขาดแคลน 6 สาขาหลัก",
      "อบรมเฉพาะใน รพศ.",
      "ระบุ รพ.ต้นสังกัด",
      "ได้เงินเดือน เงินพิเศษ และเลื่อนขั้นเงินเดือนเหมือนข้าราชการที่ไปช่วยราชการ",
    ],
  },
  {
    title: "ทุนรอบปกติ",
    points: [
      "ถ้านับเฉพาะ 6 สาขาหลัก จะเป็นทุนเขตสุขภาพ",
      "จบแล้วอาจถูกส่งไป รพ. ใดก็ได้ในเขตสุขภาพนั้น",
      "เรียนในโรงเรียนแพทย์ได้",
      "เป็นการลาเรียนตามระเบียบ ไม่ได้ขึ้นเงินเดือน ไม่ได้เงินพิเศษ",
    ],
  },
];

const box = "rounded-2xl border-2 border-ink bg-white p-4";
const UNCHECKED = "สรุปจากคำบอกเล่า เป็นความเห็นส่วนหนึ่ง ตัวเลขยังไม่ได้ตรวจสอบกับประกาศทางการ";

function Section({ id, note, children }: { id: keyof typeof SECTIONS; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 space-y-3">
      <h2 className="text-2xl font-bold">{SECTIONS[id]}</h2>
      {note && <p className="rounded-xl border-2 border-dashed border-ink px-3 py-2 text-sm">{note}</p>}
      {children}
    </section>
  );
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export function GuideContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">คู่มือ</h1>
        <nav aria-label="หัวข้อในคู่มือ" className="flex flex-wrap gap-2 text-sm font-semibold">
          {Object.entries(SECTIONS).map(([id, title]) => (
            <a key={id} href={`#${id}`} className="rounded-full border-2 border-ink bg-white px-3 py-1 hover:bg-graduate">{title}</a>
          ))}
        </nav>
      </div>

      <Section id="levels" note="จำนวนเตียงเป็นค่าประมาณ">
        <ul className="space-y-3">
          {LEVELS.map(([short, name, level, role]) => (
            <li key={short} className={box}>
              <p className="font-bold">{short} · {name}</p>
              <p className="text-sm text-muted">{level}</p>
              <p>{role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="register">
        <div className={`${box} space-y-3`}>
          <p>ตอนลงทะเบียนเพื่อใช้ทุน มีให้เลือก 4 แบบ</p>
          <ol className="list-decimal pl-5">
            <li>ได้ที่ใช้ทุนแล้ว จากการสมัครโรงเรียนแพทย์ต่าง ๆ</li>
            <li>แพทย์พี่เลี้ยง</li>
            <li>จับฉลาก</li>
            <li>ชดใช้เงิน</li>
          </ol>
          <p>ถ้าสมัครแพทย์พี่เลี้ยงแล้วไม่ได้รับคัดเลือกทุกรอบ ต้องลงทะเบียนใหม่ แล้วเลือกจับฉลากหรือชดใช้เงิน ผู้ที่เลือกจับฉลากตอนนี้จะจับพร้อมกับคนที่เลือกตั้งแต่รอบแรก</p>
        </div>
      </Section>

      <Section id="timeline" note="ข้อมูลจากเพจ “จบ extern แล้วไปไหนดี” กันยายน 2561 เดือนเป็นค่าประมาณและเปลี่ยนได้ในแต่ละปี โปรดตรวจประกาศปีล่าสุด">
        <dl className={`${box} grid gap-x-4 gap-y-2 sm:grid-cols-[8rem_1fr]`}>
          {TIMELINE.map(([months, name]) => (
            <div key={name} className="sm:contents">
              <dt className="font-bold">{months}</dt>
              <dd>{name}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="eligibility" note="เรียบเรียงจากภาพสรุปของสำนักส่งเสริม สนับสนุน การผลิต พัฒนาแพทย์ฯ (สพพ.) ตามประกาศ สป.สธ. ภาพไม่ได้ระบุปีของประกาศ">
        {ELIGIBILITY.map(({ who, rows }) => (
          <details key={who} className={box}>
            <summary className="cursor-pointer font-bold">{who}</summary>
            <div className="mt-3 space-y-3">
              {rows.map(([years, normal, special]) => (
                <div key={years} className="border-t-2 border-ink pt-2">
                  <h3 className="font-bold">{years}</h3>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="font-semibold text-muted">พื้นที่ปกติ</dt><dd>{normal}</dd></div>
                    <div><dt className="font-semibold text-muted">พื้นที่ส่งเสริมพิเศษ หรือรับต้นสังกัดพื้นที่นั้น</dt><dd>{special}</dd></div>
                  </dl>
                </div>
              ))}
            </div>
          </details>
        ))}
        <div className={box}>
          <p className="font-bold">5. แพทย์ที่โอนมาจากกรมอื่นในกระทรวงสาธารณสุข</p>
          <p>ต้องปฏิบัติงานในสังกัด สป.สธ. อย่างน้อย 1 ปี (นับถึงวันเปิดการศึกษา) และหมดพันธะชดใช้ทุน จึงสมัครรับต้นสังกัดได้ทุกสาขาตามโควตาที่ สป.สธ. จัดสรร</p>
        </div>
      </Section>

      <Section id="university" note={UNCHECKED}>
        {UNIVERSITY.map(([topic, state, privateSchool]) => (
          <div key={topic} className={box}>
            <h3 className="font-bold">{topic}</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="font-semibold text-muted">ม.รัฐ</dt><dd>{state}</dd></div>
              <div><dt className="font-semibold text-muted">ม.เอกชน</dt><dd>{privateSchool}</dd></div>
            </dl>
          </div>
        ))}
      </Section>

      <Section id="fixward" note={UNCHECKED}>
        <p>นอกจาก Fix Ward จะประหยัดเวลาได้ 2 ปีแล้ว สองทางนี้ยังต่างกันดังนี้</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIX_WARD.map(({ title, pros, cons }) => (
            <div key={title} className={`${box} space-y-2`}>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="font-semibold">ข้อได้เปรียบ</p>
              <Bullets items={pros} />
              <p className="font-semibold">ข้อเสียเปรียบ</p>
              <Bullets items={cons} />
            </div>
          ))}
        </div>
        <p className={box}>ชอบวิชาการ อยากเชี่ยวชาญเฉพาะทางเร็ว → Fix Ward<br />ชอบงานหน้างาน อยากรู้จักคนเยอะ ไม่รีบ หรือยังไม่รู้ว่าชอบ ward ไหน → ใช้ทุนปกติ</p>
      </Section>

      <Section id="scholarship" note={UNCHECKED}>
        <div className="grid gap-3 sm:grid-cols-2">
          {SCHOLARSHIPS.map(({ title, points }) => (
            <div key={title} className={`${box} space-y-2`}>
              <h3 className="text-lg font-bold">{title}</h3>
              <Bullets items={points} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="sources">
        <div className={box}>
          <Bullets
            items={[
              "ภาพรวมและระบบสมัครกลาง: เว็บแพทยสภา (คู่มือ เกณฑ์ และจำนวนรับของทุกสถาบัน)",
              "ทุนกระทรวง: กองบริหารทรัพยากรบุคคล สป.สธ. (เว็บหรือเพจ Facebook) สำหรับโควตาทุนต้นสังกัดและ CPIRD",
              "เกณฑ์แต่ละสาขา: เว็บราชวิทยาลัยของสาขานั้น (เกณฑ์คัดเลือกและวันสัมภาษณ์)",
              "แพทย์ใช้ทุนของมหาวิทยาลัย: ฝ่ายหลังปริญญาของแต่ละคณะแพทยศาสตร์",
              "แผนผังเส้นทางในหน้าแรกดัดแปลงจากภาพของ We Mahidol",
            ]}
          />
          <p className="mt-3">
            สพพ.: <a href="https://cpird.moph.go.th/" rel="noreferrer" className="underline">https://cpird.moph.go.th/</a>
          </p>
        </div>
      </Section>
    </div>
  );
}
