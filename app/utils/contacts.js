// app/utils/contacts.js

export function allTels(client) {
  return [client?.tel, ...(client?.tels || [])].filter(Boolean)
}

export function allEmails(client) {
  return [client?.email, ...(client?.emails || [])].filter(Boolean)
}

export function allFaxes(client) {
  return [client?.fax, ...(client?.faxes || [])].filter(Boolean)
}