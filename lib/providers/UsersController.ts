import * as axios from 'axios';
import { DavPlan } from "../models/DavUser";
import { Dav, ApiResponse, ApiErrorResponse, ConvertHttpResponseToErrorResponse } from '../Dav';
import { Auth } from '../models/Auth';
import { App, ConvertObjectArrayToApps } from '../models/App';

export interface SignupResponseData{
	id: number;
	email: string;
	username: string;
	confirmed: boolean;
	plan: DavPlan;
	totalStorage: number;
	usedStorage: number;
	jwt: string;
}

export async function Signup(
	auth: Auth, 
	email: string, 
	password: string, 
	username: string, 
	appId: number = -1, 
	apiKey: string = null,
	deviceName: string = null,
	deviceType: string = null,
	deviceOs: string = null
) : Promise<(ApiResponse<SignupResponseData> | ApiErrorResponse)>{
	let url = `${Dav.apiBaseUrl}/auth/signup`;

	let data = {};
	let params = {
		email,
		password,
		username
	}

	if(appId != -1){
		params["app_id"] = appId;

		data = {
			api_key: apiKey,
			device_name: deviceName,
			device_type: deviceType,
			device_os: deviceOs
		}
	}

	try{
		let response = await axios.default({
			method: 'post',
			url,
			headers: {
				Authorization: auth.token
			},
			params,
			data
		});

		return {
			status: response.status,
			data: {
				id: response.data.id,
				email: response.data.email,
				username: response.data.username,
				confirmed: response.data.confirmed,
				plan: response.data.plan,
				totalStorage: response.data.total_storage,
				usedStorage: response.data.used_storage,
				jwt: response.data.jwt
			}
		}
	}catch(error){
		if(error.response){
			// Api error
			return ConvertHttpResponseToErrorResponse(error.response);
		}else{
			// Javascript error
			return {status: -1, errors: []};
		}
	}
}

export interface LoginResponseData{
	jwt: string;
	userId: number;
}

export async function Login(
	auth: Auth,
	email: string,
	password: string
) : Promise<(ApiResponse<LoginResponseData> | ApiErrorResponse)>{
	let url = `${Dav.apiBaseUrl}/auth/login`;

	let params = {
		email,
		password
	}

	try{
		let response = await axios.default({
			method: 'get',
			url,
			headers: {
				Authorization: auth.token
			},
			params
		});

		return {
			status: response.status,
			data: {
				jwt: response.data.jwt,
				userId: response.data.user_id
			}
		}
	}catch(error){
		if(error.response){
			// Api error
			return ConvertHttpResponseToErrorResponse(error.response);
		}else{
			// Javascript error
			return {status: -1, errors: []};
		}
	}
}

export interface UserResponseData{
	id: number;
	email: string;
	username: string;
	confirmed: boolean;
	newEmail: string;
	oldEmail: string;
	createdAt: string;
	updatedAt: string;
	plan: number;
	periodEnd: string;
	subscriptionStatus: number;
	totalStorage: number;
	usedStorage: number;
	lastActive: string;
	avatar: string;
	avatarEtag: string;
	apps: App[];
}

export async function UpdateUser(
	jwt: string,
	properties: {
		email?: string,
		username?: string,
		password?: string,
		avatar?: string,
		paymentToken?: string,
		plan?: number
	}
) : Promise<(ApiResponse<UserResponseData> | ApiErrorResponse)>{
	let url = `${Dav.apiBaseUrl}/auth/user`;

	let data: object = {};

	if(properties.email) data["email"] = properties.email;
	if(properties.username) data["username"] = properties.username;
	if(properties.password) data["password"] = properties.password;
	if(properties.avatar) data["avatar"] = properties.avatar;
	if(properties.paymentToken) data["payment_token"] = properties.paymentToken;
	if(properties.plan) data["plan"] = properties.plan;

	try{
		let response = await axios.default({
			method: 'put',
			url,
			headers: {
				Authorization: jwt
			},
			data
		});

		return {
			status: response.status,
			data: {
				id: response.data.id,
				email: response.data.email,
				username: response.data.username,
				confirmed: response.data.confirmed,
				newEmail: response.data.new_email,
				oldEmail: response.data.old_email,
				createdAt: response.data.created_at,
				updatedAt: response.data.updated_at,
				plan: response.data.plan,
				periodEnd: response.data.period_end,
				subscriptionStatus: response.data.subscription_status,
				totalStorage: response.data.total_storage,
				usedStorage: response.data.used_storage,
				lastActive: response.data.last_active,
				avatar: response.data.avatar,
				avatarEtag: response.data.avatar_etag,
				apps: ConvertObjectArrayToApps(response.data.apps)
			}
		}
	}catch(error){
		if(error.response){
			// Api error
			return ConvertHttpResponseToErrorResponse(error.response);
		}else{
			// Javascript Error
			return {status: -1, errors: []};
		}
	}
}