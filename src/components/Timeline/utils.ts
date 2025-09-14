export const getMobileLabelledMarks = (
  marks: Array<{ value: number; label: string }>,
  selected: number
) => {
  if (!marks.length) return [];
  const [first, last] = [marks[0].value, marks[marks.length - 1].value];
  return marks.map(m =>
    m.value === first || m.value === last || m.value === selected
      ? m
      : { value: m.value, label: "" }
  );
};
