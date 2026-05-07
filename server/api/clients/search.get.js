import Client from '~~/server/models/Client'

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)

  if (!q || q.length < 2) return { success: true, clients: [] }

  const regex = { $regex: q, $options: 'i' }

  const clients = await Client.find({
    $or: [
      { lastname: regex },
      { firstname: regex },
      { company: regex },
      { email: regex },
      { city: regex },
      {
        $expr: {
          $regexMatch: {
            input: { $concat: [{ $ifNull: ['$lastname', ''] }, ' ', { $ifNull: ['$firstname', ''] }] },
            regex: q,
            options: 'i'
          }
        }
      },
      {
        $expr: {
          $regexMatch: {
            input: { $concat: [{ $ifNull: ['$firstname', ''] }, ' ', { $ifNull: ['$lastname', ''] }] },
            regex: q,
            options: 'i'
          }
        }
      }
    ]
  })
    .select('firstname lastname company city state vip address cap region tel fax email piva')
    .sort({ lastname: 1, firstname: 1 })
    .limit(30)
    .lean()

  return { success: true, clients }
})