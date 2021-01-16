import * as axios from 'axios'
import { Dav } from '../Dav'
import { ApiResponse, ApiErrorResponse } from '../types'
import { ConvertErrorToApiErrorResponse } from '../utils'
import { App } from '../models/App'
import { ConvertObjectArrayToApps } from '../models/App'
import { ConvertObjectArrayToTables } from '../models/Table'
import { ConvertObjectArrayToApis } from '../models/Api'

export async function GetApps(): Promise<ApiResponse<App[]> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'get',
			url: `${Dav.apiBaseUrl}/apps`
		})

		return {
			status: response.status,
			data: ConvertObjectArrayToApps(response.data.apps)
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function GetApp(params: {
	jwt: string,
	id: number
}): Promise<ApiResponse<App> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'get',
			url: `${Dav.apiBaseUrl}/app/${params.id}`,
			headers: {
				Authorization: params.jwt
			}
		})

		return {
			status: response.status,
			data: new App(
				response.data.id,
				response.data.name,
				response.data.description,
				response.data.published,
				response.data.web_link,
				response.data.google_play_link,
				response.data.microsoft_store_link,
				null,
				ConvertObjectArrayToTables(response.data.tables),
				ConvertObjectArrayToApis(response.data.apis)
			)
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export async function UpdateApp(params: {
	jwt: string,
	id: number,
	name?: string,
	description?: string,
	published?: boolean,
	webLink?: string,
	googlePlayLink?: string,
	microsoftStoreLink?: string
}): Promise<ApiResponse<App> | ApiErrorResponse>{
	try {
		let data = {}
		if (params.name != null) data["name"] = params.name
		if (params.description != null) data["description"] = params.description
		if (params.published != null) data["published"] = params.published
		if (params.webLink != null) data["web_link"] = params.webLink
		if (params.googlePlayLink != null) data["google_play_link"] = params.googlePlayLink
		if (params.microsoftStoreLink != null) data["microsoft_store_link"] = params.microsoftStoreLink

		let response = await axios.default({
			method: 'put',
			url: `${Dav.apiBaseUrl}/app/${params.id}`,
			headers: {
				Authorization: params.jwt
			},
			data
		})

		return {
			status: response.status,
			data: new App(
				response.data.id,
				response.data.name,
				response.data.description,
				response.data.published,
				response.data.web_link,
				response.data.google_play_link,
				response.data.microsoft_store_link
			)
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}