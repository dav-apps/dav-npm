import { assert } from 'chai'
import * as moxios from 'moxios'
import { Dav } from '../../lib/Dav'
import { ApiResponse, ApiErrorResponse } from '../../lib/types'
import { App } from '../../lib/models/App'
import { GetApps, GetApp, UpdateApp } from '../../lib/controllers/AppsController'
import { Table } from '../../lib/models/Table'
import { Api } from '../../lib/models/Api'

beforeEach(() => {
	moxios.install()
})

afterEach(() => {
	moxios.uninstall()
})

describe("GetApps function", () => {
	it("should call getApps endpoint", async () => {
		// Arrange
		let firstAppId = 12
		let firstAppDevId = 1
		let firstAppName = "TestApp"
		let firstAppDescription = "TestApp description"
		let firstAppPublished = true
		let firstAppWebLink = "https://testapp.dav-apps.tech"
		let firstAppGooglePlayLink = null
		let firstAppMicrosoftStoreLink = null
		let secondAppId = 14
		let secondAppDevId = 2
		let secondAppName = "SecondTestApp"
		let secondAppDescription = "This is the second test app"
		let secondAppPublished = true
		let secondAppWebLink = null
		let secondAppGooglePlayLink = "https://play.google.com/store/apps/bla"
		let secondAppMicrosoftStoreLink = "https://store.microsoft.com/bla"

		let url = `${Dav.apiBaseUrl}/apps`

		let expectedResult: ApiResponse<App[]> = {
			status: 200,
			data: [
				new App(
					firstAppId,
					firstAppName,
					firstAppDescription,
					firstAppPublished,
					firstAppWebLink,
					firstAppGooglePlayLink,
					firstAppMicrosoftStoreLink
				),
				new App(
					secondAppId,
					secondAppName,
					secondAppDescription,
					secondAppPublished,
					secondAppWebLink,
					secondAppGooglePlayLink,
					secondAppMicrosoftStoreLink
				)
			]
		}

		moxios.wait(() => {
			let request = moxios.requests.mostRecent()

			// Assert for the request
			assert.equal(request.config.url, url)
			assert.equal(request.config.method, 'get')

			request.respondWith({
				status: expectedResult.status,
				response: {
					apps: [
						{
							id: firstAppId,
							dev_id: firstAppDevId,
							name: firstAppName,
							description: firstAppDescription,
							published: firstAppPublished,
							web_link: firstAppWebLink,
							google_play_link: firstAppGooglePlayLink,
							microsoft_store_link: firstAppMicrosoftStoreLink
						},
						{
							id: secondAppId,
							dev_id: secondAppDevId,
							name: secondAppName,
							description: secondAppDescription,
							published: secondAppPublished,
							web_link: secondAppWebLink,
							google_play_link: secondAppGooglePlayLink,
							microsoft_store_link: secondAppMicrosoftStoreLink
						}
					]
				}
			})
		})

		// Act
		let result = await GetApps() as ApiResponse<App[]>

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.data.length, expectedResult.data.length)

		assert.equal(result.data[0].Id, expectedResult.data[0].Id)
		assert.equal(result.data[0].Name, expectedResult.data[0].Name)
		assert.equal(result.data[0].Description, expectedResult.data[0].Description)
		assert.equal(result.data[0].Published, expectedResult.data[0].Published)
		assert.equal(result.data[0].WebLink, expectedResult.data[0].WebLink)
		assert.equal(result.data[0].GooglePlayLink, expectedResult.data[0].GooglePlayLink)
		assert.equal(result.data[0].MicrosoftStoreLink, expectedResult.data[0].MicrosoftStoreLink)

		assert.equal(result.data[1].Id, expectedResult.data[1].Id)
		assert.equal(result.data[1].Name, expectedResult.data[1].Name)
		assert.equal(result.data[1].Description, expectedResult.data[1].Description)
		assert.equal(result.data[1].Published, expectedResult.data[1].Published)
		assert.equal(result.data[1].WebLink, expectedResult.data[1].WebLink)
		assert.equal(result.data[1].GooglePlayLink, expectedResult.data[1].GooglePlayLink)
		assert.equal(result.data[1].MicrosoftStoreLink, expectedResult.data[1].MicrosoftStoreLink)
	})

	it("should call getApps endpoint with error", async () => {
		// Arrange
		let url = `${Dav.apiBaseUrl}/apps`

		let expectedResult: ApiErrorResponse = {
			status: 403,
			errors: [{
				code: 1103,
				message: "Action not allowed"
			}]
		}

		moxios.wait(() => {
			let request = moxios.requests.mostRecent()

			// Assert for the request
			assert.equal(request.config.url, url)
			assert.equal(request.config.method, 'get')

			request.respondWith({
				status: expectedResult.status,
				response: {
					errors: [{
						code: expectedResult.errors[0].code,
						message: expectedResult.errors[0].message
					}]
				}
			})
		})

		// Act
		let result = await GetApps() as ApiErrorResponse

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.errors[0].code, expectedResult.errors[0].code)
		assert.equal(result.errors[0].message, expectedResult.errors[0].message)
	})
})

describe("GetApp function", () => {
	it("should call getApp endpoint", async () => {
		// Arrange
		let id = 53
		let name = "TestApp"
		let description = "A test app"
		let published = true
		let webLink = "https://test.example.com"
		let googlePlayLink = "https://play.google.com/asdasdasd"
		let microsoftStoreLink = null
		let tableId = 12
		let tableName = "TestTable"
		let apiId = 2
		let apiName = "TestApi"

		let jwt = "ioasdwhehwt08r3q0feh0"
		let url = `${Dav.apiBaseUrl}/app/${id}`

		let expectedResult: ApiResponse<App> = {
			status: 200,
			data: new App(
				id,
				name,
				description,
				published,
				webLink,
				googlePlayLink,
				microsoftStoreLink,
				null,
				[
					new Table(
						tableId,
						id,
						tableName
					)
				],
				[
					new Api(
						apiId,
						apiName,
						[],
						[],
						[]
					)
				]
			)
		}

		moxios.wait(() => {
			let request = moxios.requests.mostRecent()

			// Assert for the request
			assert.equal(request.config.url, url)
			assert.equal(request.config.method, 'get')
			assert.equal(request.config.headers.Authorization, jwt)

			request.respondWith({
				status: expectedResult.status,
				response: {
					id,
					name,
					description,
					published,
					web_link: webLink,
					google_play_link: googlePlayLink,
					microsoft_store_link: microsoftStoreLink,
					tables: [{
						id: tableId,
						name: tableName
					}],
					apis: [{
						id: apiId,
						name: apiName
					}]
				}
			})
		})

		// Act
		let result = await GetApp({
			jwt,
			id
		}) as ApiResponse<App>

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.data.Id, expectedResult.data.Id)
		assert.equal(result.data.Name, expectedResult.data.Name)
		assert.equal(result.data.Description, expectedResult.data.Description)
		assert.equal(result.data.Published, expectedResult.data.Published)
		assert.equal(result.data.WebLink, expectedResult.data.WebLink)
		assert.equal(result.data.GooglePlayLink, expectedResult.data.GooglePlayLink)
		assert.equal(result.data.MicrosoftStoreLink, expectedResult.data.MicrosoftStoreLink)
		
		assert.equal(result.data.Tables.length, 1)
		assert.equal(result.data.Tables[0].Id, expectedResult.data.Tables[0].Id)
		assert.equal(result.data.Tables[0].Name, expectedResult.data.Tables[0].Name)

		assert.equal(result.data.Apis.length, 1)
		assert.equal(result.data.Apis[0].Id, expectedResult.data.Apis[0].Id)
		assert.equal(result.data.Apis[0].Name, expectedResult.data.Apis[0].Name)
	})

	it("should call getApp endpoint with error", async () => {
		// Arrange
		let id = 53

		let jwt = "ioasdwhehwt08r3q0feh0"
		let url = `${Dav.apiBaseUrl}/app/${id}`

		let expectedResult: ApiErrorResponse = {
			status: 403,
			errors: [{
				code: 1103,
				message: "Action not allowed"
			}]
		}

		moxios.wait(() => {
			let request = moxios.requests.mostRecent()

			// Assert for the request
			assert.equal(request.config.url, url)
			assert.equal(request.config.method, 'get')
			assert.equal(request.config.headers.Authorization, jwt)

			request.respondWith({
				status: expectedResult.status,
				response: {
					errors: [{
						code: expectedResult.errors[0].code,
						message: expectedResult.errors[0].message
					}]
				}
			})
		})

		// Act
		let result = await GetApp({
			jwt,
			id
		}) as ApiErrorResponse

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.errors[0].code, expectedResult.errors[0].code)
		assert.equal(result.errors[0].message, expectedResult.errors[0].message)
	})
})

describe("UpdateApp function", () => {
	it("should call updateApp endpoint", async () => {
		// Arrange
		let id = 42
		let name = "Updated name"
		let description = "Updated description"
		let published = true
		let webLink = "https://cards.dav-apps.tech"
		let googlePlayLink = "https://play.google.com/cards"
		let microsoftStoreLink = "https://store.microsoft.com/cards"

		let jwt = "ishdf0heh942893gurowfe"
		let url = `${Dav.apiBaseUrl}/app/${id}`

		let expectedResult: ApiResponse<App> = {
			status: 200,
			data: new App(
				id,
				name,
				description,
				published,
				webLink,
				googlePlayLink,
				microsoftStoreLink
			)
		}

		moxios.wait(() => {
			let request = moxios.requests.mostRecent()

			// Assert for the request
			assert.equal(request.config.url, url)
			assert.equal(request.config.method, 'put')
			assert.equal(request.config.headers.Authorization, jwt)
			assert.include(request.config.headers["Content-Type"], "application/json")

			let data = JSON.parse(request.config.data)
			assert.equal(data.name, name)
			assert.equal(data.description, description)
			assert.equal(data.published, published)
			assert.equal(data.web_link, webLink)
			assert.equal(data.google_play_link, googlePlayLink)
			assert.equal(data.microsoft_store_link, microsoftStoreLink)

			request.respondWith({
				status: expectedResult.status,
				response: {
					id,
					name,
					description,
					published,
					web_link: webLink,
					google_play_link: googlePlayLink,
					microsoft_store_link: microsoftStoreLink
				}
			})
		})

		// Act
		let result = await UpdateApp({
			jwt,
			id,
			name,
			description,
			published,
			webLink,
			googlePlayLink,
			microsoftStoreLink
		}) as ApiResponse<App>

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.data.Id, expectedResult.data.Id)
		assert.equal(result.data.Name, expectedResult.data.Name)
		assert.equal(result.data.Description, expectedResult.data.Description)
		assert.equal(result.data.Published, expectedResult.data.Published)
		assert.equal(result.data.WebLink, expectedResult.data.WebLink)
		assert.equal(result.data.GooglePlayLink, expectedResult.data.GooglePlayLink)
		assert.equal(result.data.MicrosoftStoreLink, expectedResult.data.MicrosoftStoreLink)
	})

	it("should call updateApp endpoint with error", async () => {
		// Arrange
		let id = 42
		let name = "Updated name"
		let description = "Updated description"
		let published = true
		let webLink = "https://cards.dav-apps.tech"
		let googlePlayLink = "https://play.google.com/cards"
		let microsoftStoreLink = "https://store.microsoft.com/cards"

		let jwt = "ishdf0heh942893gurowfe"
		let url = `${Dav.apiBaseUrl}/app/${id}`

		let expectedResult: ApiErrorResponse = {
			status: 403,
			errors: [{
				code: 1103,
				message: "Action not allowed"
			}]
		}

		moxios.wait(() => {
			let request = moxios.requests.mostRecent()

			// Assert for the request
			assert.equal(request.config.url, url)
			assert.equal(request.config.method, 'put')
			assert.equal(request.config.headers.Authorization, jwt)
			assert.include(request.config.headers["Content-Type"], "application/json")

			let data = JSON.parse(request.config.data)
			assert.equal(data.name, name)
			assert.equal(data.description, description)
			assert.equal(data.published, published)
			assert.equal(data.web_link, webLink)
			assert.equal(data.google_play_link, googlePlayLink)
			assert.equal(data.microsoft_store_link, microsoftStoreLink)

			request.respondWith({
				status: expectedResult.status,
				response: {
					errors: [{
						code: expectedResult.errors[0].code,
						message: expectedResult.errors[0].message
					}]
				}
			})
		})

		// Act
		let result = await UpdateApp({
			jwt,
			id,
			name,
			description,
			published,
			webLink,
			googlePlayLink,
			microsoftStoreLink
		}) as ApiErrorResponse

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.errors[0].code, expectedResult.errors[0].code)
		assert.equal(result.errors[0].message, expectedResult.errors[0].message)
	})
})