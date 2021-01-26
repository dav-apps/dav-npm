import * as axios from 'axios'
import { Dav } from '../Dav'
import { ApiResponse, ApiErrorResponse } from '../types'
import { ConvertErrorToApiErrorResponse } from '../utils'
import { Table } from '../models/Table'

export async function CreateTable(params: {
	accessToken: string,
	appId: number,
	name: string
}) : Promise<ApiResponse<Table> | ApiErrorResponse> {
	try {
		let response = await axios.default({
			method: 'post',
			url: `${Dav.apiBaseUrl}/table`,
			headers: {
				Authorization: params.accessToken
			},
			data: {
				app_id: params.appId,
				name: params.name
			}
		})

		return {
			status: response.status,
			data: new Table(
				response.data.id,
				response.data.app_id,
				response.data.name
			)
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}

export interface GetTableResponseData{
	table: Table
	pages: number
	tableObjects: {
		uuid: string
		etag: string
	}[]
}

export async function GetTable(params: {
	accessToken: string,
	id: number,
	count?: number,
	page?: number
}) : Promise<ApiResponse<GetTableResponseData> | ApiErrorResponse> {
	try {
		let urlParams = {}
		if (params.count != null) urlParams["count"] = params.count
		if (params.page != null) urlParams["page"] = params.page

		let response = await axios.default({
			method: 'get',
			url: `${Dav.apiBaseUrl}/table/${params.id}`,
			headers: {
				Authorization: params.accessToken
			},
			params: urlParams
		})

		return {
			status: response.status,
			data: {
				table: new Table(
					response.data.id,
					response.data.app_id,
					response.data.name
				),
				pages: response.data.pages,
				tableObjects: response.data.table_objects
			}
		}
	} catch (error) {
		return ConvertErrorToApiErrorResponse(error)
	}
}
