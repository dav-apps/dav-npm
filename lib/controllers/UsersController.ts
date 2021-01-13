import * as axios from 'axios'
import { Dav } from '../Dav'
import { ApiResponse, ApiErrorResponse, SubscriptionStatus } from '../types'
import { ConvertErrorToApiErrorResponse } from '../utils'
import { Auth } from '../models/Auth'
import { User } from '../models/User'
import { ConvertObjectArrayToApps } from '../models/App'

export interface SignupResponseData{
	user: User,
	jwt: string,
	websiteJwt?: string
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
}): Promise<ApiResponse<SignupResponseData> | ApiErrorResponse>{
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
				jwt: response.data.jwt,
				websiteJwt: response.data.website_jwt
			}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function GetUser(params: {
	jwt: string
}): Promise<ApiResponse<User> | ApiErrorResponse>{
	try {
		let response = await axios.default({
			method: 'get',
			url: `${Dav.apiBaseUrl}/user`,
			headers: {
				Authorization: params.jwt
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
		return ConvertErrorToApiErrorResponse(error)
	}
}