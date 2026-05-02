import React, { useMemo, useState } from "react";

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border bg-white ${className}`}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 ${className}`}
    >
      {children}
    </button>
  );
}

const gradeScale = [
  { label: "A+", points: 970 },
  { label: "A", points: 920 },
  { label: "A-", points: 880 },
  { label: "B+", points: 840 },
  { label: "B", points: 800 },
  { label: "B-", points: 760 },
  { label: "C+", points: 720 },
  { label: "C", points: 640 },
  { label: "D", points: 520 },
];

const examMaxPoints = [30, 54, 54, 54, 54, 54];

const ecItems = [
  { id: "chem113", label: "EX Chemistry 113 Review", points: 15 },
  { id: "syllabus", label: "Syllabus Quiz", points: 5 },
  ...Array.from({ length: 7 }, (_, index) => ({
    id: `discussion-${index + 1}`,
    label: `Discussion Post ${index + 1}`,
    points: 4,
  })),
  ...Array.from({ length: 14 }, (_, index) => ({
    id: `practice-${index + 1}`,
    label: `Practice Set ${index + 1}`,
    points: 3,
  })),
  { id: "surprise", label: "Surprise DP", points: 4 },
  { id: "review50", label: "50% Course Review", points: 5 },
];

function clampNumber(value, min, max) {
  const number = Number(value);
  if (Number.isNaN(number)) return 0;
  return Math.min(max, Math.max(min, number));
}

function letterFromPoints(points, finalPercent) {
  if (finalPercent < 25) return "E, because the final is below 25%";
  if (points >= 970) return "A+";
  if (points >= 920) return "A";
  if (points >= 880) return "A-";
  if (points >= 840) return "B+";
  if (points >= 800) return "B";
  if (points >= 760) return "B-";
  if (points >= 720) return "C+";
  if (points >= 640) return "C";
  if (points >= 520) return "D";
  return "E";
}

function gradeRank(label) {
  const cleanLabel = String(label).split(",")[0];
  const order = ["E", "D", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
  return order.indexOf(cleanLabel);
}

function calculateWeeklyFromIndividual(examScores, finalPercent) {
  const scores = examScores.map((value, index) => clampNumber(value, 0, examMaxPoints[index]));
  const percentages = scores.map((score, index) => (score / examMaxPoints[index]) * 100);
  const lowestPercent = Math.min(...percentages);
  const lowestIndex = percentages.indexOf(lowestPercent);
  const applies = finalPercent > lowestPercent;
  const adjustedPercentages = percentages.map((percent, index) =>
    applies && index === lowestIndex ? finalPercent : percent
  );
  const earned = adjustedPercentages.reduce(
    (sum, percent, index) => sum + examMaxPoints[index] * (percent / 100),
    0
  );
  const originalEarned = scores.reduce((sum, score) => sum + score, 0);

  return {
    earned,
    originalEarned,
    applies,
    lowestIndex,
    lowestPercent,
    adjustedPercentages,
    scores,
    percentages,
  };
}

function calculateTotal({ weeklyAverage, labAverage, homeworkAverage, finalPercent, ecPoints, useIndividualExams, examScores }) {
  const labs = 200 * (clampNumber(labAverage, 0, 100) / 100);
  const homework = 300 * (clampNumber(homeworkAverage, 0, 100) / 100);
  const final = 200 * (clampNumber(finalPercent, 0, 100) / 100);
  const ec = Math.min(99, Math.max(0, Number(ecPoints) || 0));

  let weekly = 300 * (clampNumber(weeklyAverage, 0, 100) / 100);
  let resurrection = null;

  if (useIndividualExams) {
    resurrection = calculateWeeklyFromIndividual(examScores, clampNumber(finalPercent, 0, 100));
    weekly = resurrection.earned;
  }

  const total = weekly + labs + homework + final + ec;
  return { total, weekly, labs, homework, final, ec, resurrection };
}

function findNeededFinal(targetPoints, settings) {
  for (let fp = 25; fp <= 100.0001; fp += 0.01) {
    const result = calculateTotal({ ...settings, finalPercent: fp });
    if (result.total >= targetPoints) return Number(fp.toFixed(2));
  }
  return null;
}

function NumberInput({ label, value, onChange, suffix = "%", helper, max = 100, disabled = false }) {
  return (
    <label className={`block ${disabled ? "opacity-60" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <div className={`flex items-center rounded-2xl border px-3 shadow-sm focus-within:ring-2 focus-within:ring-slate-300 ${disabled ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-white"}`}>
        <input
          type="number"
          min="0"
          max={max}
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onChange(String(clampNumber(event.target.value, 0, max)))}
          className={`w-full bg-transparent py-3 text-base outline-none ${disabled ? "cursor-not-allowed text-slate-500" : ""}`}
        />
        <span className="text-sm text-slate-500">{suffix}</span>
      </div>
      {helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

export default function ChemistryFinalGradeCalculator() {
  const [weeklyAverage, setWeeklyAverage] = useState("70");
  const [labAverage, setLabAverage] = useState("99.5");
  const [homeworkAverage, setHomeworkAverage] = useState("99.5");
  const [finalPercent, setFinalPercent] = useState("50");
  const [useIndividualExams, setUseIndividualExams] = useState(true);
  const [examScores, setExamScores] = useState([24, 25.2, 36, 28.8, 25.2, 50.4]);
  const [selectedEc, setSelectedEc] = useState({});

  const selectedEcPoints = useMemo(
    () => ecItems.reduce((sum, item) => sum + (selectedEc[item.id] ? item.points : 0), 0),
    [selectedEc]
  );

  const totalEc = Math.min(99, selectedEcPoints);
  const allEcSelected = ecItems.every((item) => selectedEc[item.id]);

  const settings = useMemo(
    () => ({
      weeklyAverage,
      labAverage,
      homeworkAverage,
      ecPoints: totalEc,
      useIndividualExams,
      examScores,
    }),
    [weeklyAverage, labAverage, homeworkAverage, totalEc, useIndividualExams, examScores]
  );

  const current = useMemo(
    () => calculateTotal({ ...settings, finalPercent: clampNumber(finalPercent, 0, 100) }),
    [settings, finalPercent]
  );

  const neededRows = useMemo(
    () => gradeScale.map((grade) => ({ ...grade, needed: findNeededFinal(grade.points, settings) })),
    [settings]
  );

  const finalNumber = clampNumber(finalPercent, 0, 100);
  const currentLetter = letterFromPoints(current.total, finalNumber);

  const missedEcMessage = useMemo(() => {
    const remainingEc = Math.max(0, 99 - totalEc);
    if (remainingEc <= 0 || finalNumber < 25) return null;

    const maxEcResult = calculateTotal({ ...settings, ecPoints: 99, finalPercent: finalNumber });
    const maxEcLetter = letterFromPoints(maxEcResult.total, finalNumber);

    if (gradeRank(maxEcLetter) > gradeRank(currentLetter)) {
      return `You could've had a ${maxEcLetter} if you did more of the extra credit. But hey, choices were made.`;
    }

    return null;
  }, [settings, totalEc, finalNumber, currentLetter]);

  const resetEc = () => {
    setSelectedEc({});
  };

  const toggleAllEc = () => {
    const next = {};
    ecItems.forEach((item) => {
      next[item.id] = !allEcSelected;
    });
    setSelectedEc(next);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span aria-hidden="true">🧪</span> CHM 116 grade planner
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Final Exam Grade Calculator</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600 md:text-lg">
            Enter your category averages, weekly exam points, and extra credit. The calculator shows what final exam score you need for each course grade and whether the Final Exam Resurrection Rule helps you.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">Course averages</h2>
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Weekly exams average</h3>
                      <p className="text-sm text-slate-500">
                        {useIndividualExams
                          ? "Locked because individual weekly exam points are being used instead."
                          : "Active because individual weekly exam points are turned off."}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${useIndividualExams ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-800"}`}>
                      {useIndividualExams ? "Locked" : "Active"}
                    </span>
                  </div>
                  <NumberInput
                    label="Average percentage"
                    value={weeklyAverage}
                    onChange={setWeeklyAverage}
                    disabled={useIndividualExams}
                    helper="Turn off individual exams below to edit this average directly."
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <NumberInput label="Laboratory average" value={labAverage} onChange={setLabAverage} />
                  <NumberInput label="Chapter homework average" value={homeworkAverage} onChange={setHomeworkAverage} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Weekly exam details</h2>
                    <p className="text-sm text-slate-500">Enter points earned. Week 1 is capped at 30 points. Weeks 2 through 6 are capped at 54 points.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseIndividualExams(!useIndividualExams)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${useIndividualExams ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700"}`}
                  >
                    {useIndividualExams ? "Using individual exams" : "Using average only"}
                  </button>
                </div>

                {useIndividualExams ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {examScores.map((score, index) => (
                      <NumberInput
                        key={index}
                        label={`Week ${index + 1} exam points`}
                        value={score}
                        max={examMaxPoints[index]}
                        suffix={`/ ${examMaxPoints[index]}`}
                        onChange={(value) => {
                          const next = [...examScores];
                          next[index] = clampNumber(value, 0, examMaxPoints[index]);
                          setExamScores(next);
                        }}
                        helper={`This equals ${((clampNumber(score, 0, examMaxPoints[index]) / examMaxPoints[index]) * 100).toFixed(2)}%.`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                    Resurrection cannot be checked from the average alone because the rule depends on the lowest individual unit exam percentage.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Extra credit</h2>
                    <p className="text-sm text-slate-500">Select completed or expected items. Extra credit is capped at 99 points.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={toggleAllEc} className="rounded-full">
                      {allEcSelected ? "Clear all" : "Select all"}
                    </Button>
                    <Button onClick={resetEc} className="rounded-full">
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="text-sm font-medium text-slate-600">Selected EC total</div>
                  <div className="mt-1 text-3xl font-bold">{totalEc.toFixed(0)} / 99</div>
                  {selectedEcPoints > 99 ? (
                    <p className="mt-2 text-sm text-amber-700">The selected amount is above the hard cap, so only 99 points are counted.</p>
                  ) : null}
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {ecItems.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300">
                      <input
                        type="checkbox"
                        checked={!!selectedEc[item.id]}
                        onChange={(event) => setSelectedEc({ ...selectedEc, [item.id]: event.target.checked })}
                        className="h-5 w-5 rounded border-slate-300"
                      />
                      <span className="flex-1 text-sm">{item.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{item.points} pts</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">Try a final exam score</h2>
                <NumberInput label="Final exam percentage" value={finalPercent} onChange={setFinalPercent} />
                <div className="mt-5 rounded-2xl bg-slate-900 p-5 text-white">
                  <div className="text-sm text-slate-300">Projected course points</div>
                  <div className="mt-1 text-4xl font-bold">{current.total.toFixed(1)}</div>
                  <div className="mt-2 text-lg font-semibold">Projected grade: {currentLetter}</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="text-slate-500">Weekly exams</div>
                    <div className="font-semibold">{current.weekly.toFixed(1)} / 300</div>
                  </div>
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="text-slate-500">Final exam</div>
                    <div className="font-semibold">{current.final.toFixed(1)} / 200</div>
                  </div>
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="text-slate-500">Labs</div>
                    <div className="font-semibold">{current.labs.toFixed(1)} / 200</div>
                  </div>
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="text-slate-500">Homework</div>
                    <div className="font-semibold">{current.homework.toFixed(1)} / 300</div>
                  </div>
                </div>

                {finalNumber < 25 ? (
                  <div className="mt-4 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                    <span className="mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
                    <p>A final exam score lower than 25% is an automatic E for the course.</p>
                  </div>
                ) : null}

                {useIndividualExams && current.resurrection ? (
                  <div className={`mt-4 flex gap-3 rounded-2xl p-4 text-sm ${current.resurrection.applies ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-slate-700"}`}>
                    <span className="mt-0.5 shrink-0" aria-hidden="true">{current.resurrection.applies ? "✅" : "⚠️"}</span>
                    <p>
                      {current.resurrection.applies
                        ? `Resurrection applies. Week ${current.resurrection.lowestIndex + 1}, your lowest unit exam at ${current.resurrection.lowestPercent.toFixed(2)}%, is replaced with ${finalNumber.toFixed(2)}%.`
                        : `Resurrection does not apply at this final score because your final percentage is not higher than your lowest unit exam percentage of ${current.resurrection.lowestPercent.toFixed(2)}%.`}
                    </p>
                  </div>
                ) : null}

                {missedEcMessage ? (
                  <div className="mt-4 flex gap-3 rounded-2xl bg-purple-50 p-4 text-sm text-purple-900">
                    <span className="mt-0.5 shrink-0" aria-hidden="true">☹️</span>
                    <p>{missedEcMessage}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">Final score needed</h2>
                <div className="space-y-2">
                  {neededRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div>
                        <div className="font-semibold">{row.label}</div>
                        <div className="text-xs text-slate-500">{row.points}+ course points</div>
                      </div>
                      <div className="text-right font-bold">
                        {row.needed === null ? "Not possible" : `${row.needed.toFixed(2)}%`}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  These targets assume the final must be at least 25% to avoid the automatic E rule. When individual exams are turned on, the target includes any resurrection replacement that would apply at that final score.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
