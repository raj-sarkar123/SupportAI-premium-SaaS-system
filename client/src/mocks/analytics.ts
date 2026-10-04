export const weekBars: number[] = [
  38, 44, 33, 51, 47, 58, 43, 49, 62, 54, 67, 55, 70, 61, 75, 65, 57, 68, 79,
  72, 86, 73, 81, 69, 89, 77, 93, 82,
]

export const chartDates: string[] = [27, 20, 13, 6, 0].map((daysAgo) =>
  new Date(Date.now() - daysAgo * 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
)
