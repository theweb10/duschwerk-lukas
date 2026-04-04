/**
 * CRM Integration Service
 * Supports HubSpot, Zoho CRM, and generic webhooks (e.g. Zapier).
 * Configure CRM_PROVIDER in .env: hubspot | zoho | webhook | none
 */

const provider = process.env.CRM_PROVIDER || 'none'

/**
 * Push a new contact to the configured CRM.
 * @param {Object} inquiry - The inquiry record from the DB
 * @returns {Promise<boolean>} true on success, false on failure
 */
async function pushToCRM(inquiry) {
  if (provider === 'none') return true

  try {
    if (provider === 'hubspot') return await pushToHubSpot(inquiry)
    if (provider === 'zoho') return await pushToZoho(inquiry)
    if (provider === 'webhook') return await pushToWebhook(inquiry)
  } catch (err) {
    console.error(`[CRM] Failed to push to ${provider}:`, err.message)
    return false
  }

  return false
}

async function pushToHubSpot(inquiry) {
  const apiKey = process.env.HUBSPOT_API_KEY
  if (!apiKey) throw new Error('HUBSPOT_API_KEY not set')

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      properties: {
        email: inquiry.email,
        firstname: inquiry.name.split(' ')[0] || inquiry.name,
        lastname: inquiry.name.split(' ').slice(1).join(' ') || '',
        phone: inquiry.phone || '',
        message: inquiry.message || '',
        hs_lead_status: 'NEW',
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`HubSpot API ${response.status}: ${body}`)
  }

  return true
}

async function pushToZoho(inquiry) {
  const token = process.env.ZOHO_ACCESS_TOKEN
  const domain = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.eu'
  if (!token) throw new Error('ZOHO_ACCESS_TOKEN not set')

  const response = await fetch(`${domain}/crm/v3/Leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Zoho-oauthtoken ${token}`,
    },
    body: JSON.stringify({
      data: [{
        Last_Name: inquiry.name,
        Email: inquiry.email,
        Phone: inquiry.phone || '',
        Description: inquiry.message || '',
        Lead_Source: 'Website',
      }],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Zoho API ${response.status}: ${body}`)
  }

  return true
}

async function pushToWebhook(inquiry) {
  const webhookUrl = process.env.CRM_WEBHOOK_URL
  if (!webhookUrl) throw new Error('CRM_WEBHOOK_URL not set')

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      inquiry_type: inquiry.inquiry_type,
      message: inquiry.message,
      width_cm: inquiry.width_cm,
      height_cm: inquiry.height_cm,
      created_at: inquiry.created_at,
      source: 'duschwerk-bayern-website',
    }),
  })

  if (!response.ok) {
    throw new Error(`Webhook ${response.status}`)
  }

  return true
}

module.exports = { pushToCRM }
