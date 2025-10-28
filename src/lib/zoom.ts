/**
 * Zoom API Integration
 * 
 * Setup Instructions:
 * 1. Go to https://marketplace.zoom.us/develop/create
 * 2. Create an OAuth app or use Server-to-Server OAuth
 * 3. Add required scopes: meeting:write, meeting:read, user:read
 * 4. Add environment variables to .env:
 *    - ZOOM_CLIENT_ID
 *    - ZOOM_CLIENT_SECRET
 *    - ZOOM_REDIRECT_URI (for OAuth flow)
 *    - ZOOM_ACCOUNT_ID (for Server-to-Server)
 */

interface ZoomMeetingSettings {
  host_video: boolean;
  participant_video: boolean;
  waiting_room: boolean;
  join_before_host: boolean;
  mute_upon_entry: boolean;
  approval_type: number;
  audio: 'both' | 'telephony' | 'voip';
}

interface ZoomMeetingRequest {
  topic: string;
  type: 2; // Scheduled meeting
  start_time: string; // ISO 8601 format
  duration: number; // in minutes
  timezone: string;
  agenda?: string;
  settings: ZoomMeetingSettings;
}

interface ZoomMeetingResponse {
  id: number;
  host_id: string;
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
  join_url: string;
  start_url: string;
  password?: string;
  h323_password?: string;
  encrypted_password?: string;
}

interface CreateMeetingParams {
  topic: string;
  startTime: Date;
  duration: number;
  timezone?: string;
  agenda?: string;
  accessToken?: string;
}

// Get access token using Server-to-Server OAuth (recommended for backend)
export async function getServerToServerAccessToken(): Promise<string | null> {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      console.error('Missing Zoom credentials in environment variables');
      return null;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to get Zoom access token:', error);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error);
    return null;
  }
}

// Exchange authorization code for access token (OAuth flow)
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const redirectUri = process.env.ZOOM_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Zoom OAuth credentials');
      return null;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to exchange code for token:', error);
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing Zoom OAuth credentials');
      return null;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to refresh token:', error);
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// Create a Zoom meeting
export async function createZoomMeeting(params: CreateMeetingParams): Promise<ZoomMeetingResponse | null> {
  try {
    // Use provided access token or get server-to-server token
    const accessToken = params.accessToken || await getServerToServerAccessToken();
    
    if (!accessToken) {
      console.error('No access token available for Zoom API');
      return null;
    }

    const meetingData: ZoomMeetingRequest = {
      topic: params.topic,
      type: 2, // Scheduled meeting
      start_time: params.startTime.toISOString(),
      duration: params.duration,
      timezone: params.timezone || 'Asia/Kolkata',
      agenda: params.agenda,
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        join_before_host: false,
        mute_upon_entry: false,
        approval_type: 0, // Automatically approve
        audio: 'both',
      },
    };

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to create Zoom meeting:', error);
      return null;
    }

    const meeting: ZoomMeetingResponse = await response.json();
    return meeting;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    return null;
  }
}

// Delete a Zoom meeting
export async function deleteZoomMeeting(meetingId: string, accessToken?: string): Promise<boolean> {
  try {
    const token = accessToken || await getServerToServerAccessToken();
    
    if (!token) {
      console.error('No access token available for Zoom API');
      return false;
    }

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    return false;
  }
}

// Update a Zoom meeting
export async function updateZoomMeeting(
  meetingId: string,
  params: Partial<CreateMeetingParams>,
  accessToken?: string
): Promise<boolean> {
  try {
    const token = accessToken || await getServerToServerAccessToken();
    
    if (!token) {
      console.error('No access token available for Zoom API');
      return false;
    }

    const meetingData: Partial<ZoomMeetingRequest> = {};
    
    if (params.topic) meetingData.topic = params.topic;
    if (params.startTime) meetingData.start_time = params.startTime.toISOString();
    if (params.duration) meetingData.duration = params.duration;
    if (params.timezone) meetingData.timezone = params.timezone;
    if (params.agenda) meetingData.agenda = params.agenda;

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating Zoom meeting:', error);
    return false;
  }
}

// Get Zoom user information
export async function getZoomUser(accessToken: string): Promise<{
  id: string;
  email: string;
  first_name: string;
  last_name: string;
} | null> {
  try {
    const response = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to get Zoom user:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Zoom user:', error);
    return null;
  }
}

// Generate Zoom OAuth authorization URL
export function getZoomAuthorizationUrl(state?: string): string {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const redirectUri = process.env.ZOOM_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('Missing Zoom OAuth configuration');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  if (state) {
    params.append('state', state);
  }

  return `https://zoom.us/oauth/authorize?${params.toString()}`;
}

// Verify Zoom configuration
export function verifyZoomConfig(): boolean {
  const hasServerToServer = !!(
    process.env.ZOOM_ACCOUNT_ID &&
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET
  );

  const hasOAuth = !!(
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET &&
    process.env.ZOOM_REDIRECT_URI
  );

  if (!hasServerToServer && !hasOAuth) {
    console.error('Zoom configuration incomplete. Please check environment variables.');
    return false;
  }

  return true;
}

