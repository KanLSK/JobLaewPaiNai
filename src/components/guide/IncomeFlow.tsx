/** Which Revenue Code income type each kind of work falls under, drawn as a flow. */
interface Branch {
  from: string[];
  type: "40(1)" | "40(2)" | "40(6)";
}

const COLOR = { "40(1)": "bg-graduate", "40(2)": "bg-intern", "40(6)": "bg-resident" };

const SALARY: Branch = { from: ["เงินเดือน, เงิน พตส., P4P, เงินเวร"], type: "40(1)" };
const GUARANTEE: Branch = { from: ["ได้ตามการันตี"], type: "40(2)" };
const fee = (last: string): Branch => ({ from: ["มีสัญญาเช่าพื้นที่", "มีการแบ่งค่าตอบแทนกับสถานพยาบาล", last], type: "40(6)" });

const Arrow = () => <span aria-hidden className="block text-center leading-none">↓</span>;

function Leaf({ from, type }: Branch) {
  return (
    <li className="flex flex-col gap-1">
      <ul className="flex flex-1 flex-col justify-center rounded-xl border-2 border-ink bg-white p-2 text-center text-sm">
        {from.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <Arrow />
      <p className={`rounded-full border-2 border-ink px-2 py-1 text-center font-bold ${COLOR[type]}`}>เงินได้ {type}</p>
    </li>
  );
}

function Employer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={title} className="space-y-2 rounded-2xl border-2 border-ink bg-white p-3">
      <p className="rounded-xl bg-ink px-3 py-2 text-center font-bold text-white">{title}</p>
      <Arrow />
      {children}
    </div>
  );
}

export function IncomeFlow() {
  return (
    <div id="income-flow" className="space-y-3">
      <h3 className="text-lg font-bold">รายได้แต่ละประเภทของแพทย์</h3>
      <Employer title="แพทย์ รพ.รัฐ">
        <ul className="grid gap-3 sm:grid-cols-3">
          <Leaf {...SALARY} />
          <li className="flex flex-col gap-1 sm:col-span-2">
            <p className="rounded-xl border-2 border-dashed border-ink p-2 text-center text-sm font-semibold">ออกตรวจคลินิกพิเศษร่วมด้วย</p>
            <Arrow />
            <ul className="grid flex-1 grid-cols-2 gap-3">
              <Leaf {...GUARANTEE} />
              <Leaf {...fee("ได้ตาม DF (Doctor Fee)")} />
            </ul>
          </li>
        </ul>
      </Employer>
      <Employer title="แพทย์เอกชน (Full time / Part time)">
        <ul className="grid grid-cols-2 gap-3">
          <Leaf {...GUARANTEE} />
          <Leaf {...fee("ได้ตาม DF")} />
        </ul>
      </Employer>
      <span id="income-flow-end" />
    </div>
  );
}
