import * as axios from 'axios'
import { Dav } from '../Dav'
import { ApiResponse, ApiErrorResponse, SubscriptionStatus } from '../types'
import { HandleApiError, ConvertErrorToApiErrorResponse } from '../utils'
import { Auth } from '../models/Auth'
import { User } from '../models/User'
import { ConvertObjectArrayToApps } from '../models/App'

export interface SignupResponseData {
	user: User,
	accessToken: string,
	websiteAccessToken?: string
}

export interface GetUsersResponseData {
	users: GetUsersResponseDataUser[]
}

export interface GetUsersResponseDataUser {
	id: number,
	confirmed: boolean,
	lastActive?: Date,
	plan: number,
	createdAt: Date
}

export async function Signup(params: {
	auth: Auth,
	email: string,
	firstName: string,
	password: string,
	appId: number,
	apiKey: string,
	deviceName?: string,
	deviceType?: string,
	deviceOs?: string
}): Promise<ApiResponse<SignupResponseData> | ApiErrorResponse> {
	try {
		let data = {
			email: params.email,
			first_name: params.firstName,
			password: params.password,
			app_id: params.appId,
			api_key: params.apiKey
		}
		if (params.deviceName != null) data["device_name"] = params.deviceName
		if (params.deviceType != null) data["device_type"] = params.deviceType
		if (params.deviceOs != null) data["device_os"] = params.deviceOs

		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/signup`,
			headers: {
				Authorization: params.auth.token
			},
			data
		})

		return {
			status: response.status,
			data: {
				user: new User(
					response.data.user.id,
					response.data.user.email,
					response.data.user.first_name,
					response.data.user.confirmed,
					response.data.user.total_storage,
					response.data.user.used_storage,
					null,
					response.data.user.plan,
					SubscriptionStatus.Active,
					null,
					false,
					false,
					[]
				),
				accessToken: response.data.access_token,
				websiteAccessToken: response.data.website_access_token
			}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function GetUsers(): Promise<ApiResponse<GetUsersResponseData> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'get',
			url: `${Dav.apiBaseUrl}/users`,
			headers: {
				Authorization: Dav.accessToken
			}
		})

		let users: GetUsersResponseDataUser[] = []
		for (let user of response.data.users) {
			users.push({
				id: user.id,
				confirmed: user.confirmed,
				lastActive: user.last_active == null ? null : new Date(user.last_active),
				plan: user.plan,
				createdAt: new Date(user.created_at)
			})
		}

		return {
			status: response.status,
			data: {
				users
			}
		}
	} catch (error) {
		let result = await HandleApiError(error)

		if (typeof result == "string") {
			return await GetUsers()
		} else {
			return result as ApiErrorResponse
		}
	}
}

export async function GetUser(): Promise<ApiResponse<User> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'get',
			url: `${Dav.apiBaseUrl}/user`,
			headers: {
				Authorization: Dav.accessToken
			}
		})

		return {
			status: response.status,
			data: new User(
				response.data.id,
				response.data.email,
				response.data.first_name,
				response.data.confirmed,
				response.data.total_storage,
				response.data.used_storage,
				response.data.stripe_customer_id,
				response.data.plan,
				response.data.subscription_status,
				response.data.period_end == null ? null : new Date(response.data.period_end),
				response.data.dev,
				response.data.provider,
				ConvertObjectArrayToApps(response.data.apps)
			)
		}
	} catch (error) {
		let result = await HandleApiError(error)

		if (typeof result == "string") {
			return await GetUser()
		} else {
			return result as ApiErrorResponse
		}
	}
}

export async function GetUserById(params: {
	auth: Auth,
	id: number
}): Promise<ApiResponse<User> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'get',
			url: `${Dav.apiBaseUrl}/user/${params.id}`,
			headers: {
				Authorization: params.auth.token
			}
		})

		return {
			status: response.status,
			data: new User(
				response.data.id,
				response.data.email,
				response.data.first_name,
				response.data.confirmed,
				response.data.total_storage,
				response.data.used_storage,
				response.data.stripe_customer_id,
				response.data.plan,
				response.data.subscription_status,
				response.data.period_end,
				response.data.dev,
				response.data.provider,
				ConvertObjectArrayToApps(response.data.apps)
			)
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function UpdateUser(params: {
	email?: string,
	firstName?: string,
	password?: string
}): Promise<ApiResponse<User> | ApiErrorResponse> {
	try {
		let data = {}
		if (params.email != null) data["email"] = params.email
		if (params.firstName != null) data["first_name"] = params.firstName
		if (params.password != null) data["password"] = params.password

		let response = await axios.default({
			method: 'put',
			url: `${Dav.apiBaseUrl}/user`,
			headers: {
				Authorization: Dav.accessToken
			},
			data
		})

		return {
			status: response.status,
			data: new User(
				response.data.id,
				response.data.email,
				response.data.first_name,
				response.data.confirmed,
				response.data.total_storage,
				response.data.used_storage,
				response.data.stripe_customer_id,
				response.data.plan,
				response.data.subscription_status,
				response.data.period_end == null ? null : new Date(response.data.period_end),
				response.data.dev,
				response.data.provider,
				[]
			)
		}
	} catch (error) {
		let result = await HandleApiError(error)

		if (typeof result == "string") {
			return await UpdateUser(params)
		} else {
			return result as ApiErrorResponse
		}
	}
}

export async function SetProfileImageOfUser(params: {
	file: Blob
}): Promise<ApiResponse<User> | ApiErrorResponse> {
	// Read the blob
	let readFilePromise: Promise<ProgressEvent> = new Promise((resolve) => {
		let fileReader = new FileReader()
		fileReader.onloadend = resolve
		fileReader.readAsArrayBuffer(params.file)
	})
	let readFileResult: ProgressEvent = await readFilePromise
	let data = readFileResult.currentTarget["result"]

	try {
		let response = await axios.default({
			method: 'put',
			url: `${Dav.apiBaseUrl}/user/profile_image`,
			headers: {
				Authorization: Dav.accessToken,
				'Content-Type': params.file.type
			},
			data
		})

		return {
			status: response.status,
			data: new User(
				response.data.id,
				response.data.email,
				response.data.first_name,
				response.data.confirmed,
				response.data.total_storage,
				response.data.used_storage,
				response.data.stripe_customer_id,
				response.data.plan,
				response.data.subscription_status,
				response.data.period_end == null ? null : new Date(response.data.period_end),
				response.data.dev,
				response.data.provider,
				[]
			)
		}
	} catch (error) {
		let result = await HandleApiError(error)

		if (typeof result == "string") {
			return await SetProfileImageOfUser(params)
		} else {
			return result as ApiErrorResponse
		}
	}
}

export async function CreateStripeCustomerForUser(): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/user/stripe`,
			headers: {
				Authorization: Dav.accessToken
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		let result = await HandleApiError(error)

		if (typeof result == "string") {
			return await CreateStripeCustomerForUser()
		} else {
			return result as ApiErrorResponse
		}
	}
}

export async function SendConfirmationEmail(params: {
	auth: Auth,
	id: number
}): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/user/${params.id}/send_confirmation_email`,
			headers: {
				Authorization: params.auth.token
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function SendPasswordResetEmail(params: {
	auth: Auth,
	id: number
}): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/user/${params.id}/send_password_reset_email`,
			headers: {
				Authorization: params.auth.token
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function ConfirmUser(params: {
	auth: Auth,
	id: number,
	emailConfirmationToken: string
}): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/user/${params.id}/confirm`,
			headers: {
				Authorization: params.auth.token
			},
			data: {
				email_confirmation_token: params.emailConfirmationToken
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function SaveNewEmail(params: {
	auth: Auth,
	id: number,
	emailConfirmationToken: string
}): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/user/${params.id}/save_new_email`,
			headers: {
				Authorization: params.auth.token
			},
			data: {
				email_confirmation_token: params.emailConfirmationToken
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function SaveNewPassword(params: {
	auth: Auth,
	id: number,
	passwordConfirmationToken: string
}): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/user/${params.id}/save_new_password`,
			headers: {
				Authorization: params.auth.token
			},
			data: {
				password_confirmation_token: params.passwordConfirmationToken
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function ResetEmail(params: {
	auth: Auth,
	id: number,
	emailConfirmationToken: string
}): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/user/${params.id}/reset_email`,
			headers: {
				Authorization: params.auth.token
			},
			data: {
				email_confirmation_token: params.emailConfirmationToken
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function SetPassword(params: {
	auth: Auth,
	id: number,
	password: string,
	passwordConfirmationToken: string
}): Promise<ApiResponse<{}> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'put',
			url: `${Dav.apiBaseUrl}/user/${params.id}/password`,
			headers: {
				Authorization: params.auth.token
			},
			data: {
				password: params.password,
				password_confirmation_token: params.passwordConfirmationToken
			}
		})

		return {
			status: response.status,
			data: {}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}