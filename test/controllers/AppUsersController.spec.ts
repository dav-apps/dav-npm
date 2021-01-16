import { assert } from 'chai'
import * as moxios from 'moxios'
import { Dav } from '../../lib/Dav'
import { ApiResponse, ApiErrorResponse } from '../../lib/types'
import { GetAppUsersResponseData, GetAppUsers } from '../../lib/controllers/AppUsersController'

beforeEach(() => {
	moxios.install()
})

afterEach(() => {
	moxios.uninstall()
})

describe("GetAppUsers function", () => {
	it("should call getAppUsers endpoint", async () => {
		// Arrange
		let id = 93
		let firstAppUserUserId = 1
		let firstAppUserCreatedAt = new Date("2021-01-11 23:00:00 UTC")
		let secondAppUserUserId = 2
		let secondAppUserCreatedAt = new Date("2021-01-16 23:00:00 UTC")

		let jwt = "0sdfofui239qjß0p23r"
		let url = `${Dav.apiBaseUrl}/app/${id}/users`

		let expectedResult: ApiResponse<GetAppUsersResponseData> = {
			status: 200,
			data: {
				appUsers: [
					{
						userId: firstAppUserUserId,
						createdAt: firstAppUserCreatedAt
					},
					{
						userId: secondAppUserUserId,
						createdAt: secondAppUserCreatedAt
					}
				]
			}
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
					app_users: [
						{
							user_id: firstAppUserUserId,
							created_at: firstAppUserCreatedAt
						},
						{
							user_id: secondAppUserUserId,
							created_at: secondAppUserCreatedAt
						}
					]
				}
			})
		})

		// Act
		let result = await GetAppUsers({
			jwt,
			id
		}) as ApiResponse<GetAppUsersResponseData>

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.data.appUsers.length, 2)

		assert.equal(result.data.appUsers[0].userId, expectedResult.data.appUsers[0].userId)
		assert.equal(result.data.appUsers[0].createdAt.toString(), expectedResult.data.appUsers[0].createdAt.toString())

		assert.equal(result.data.appUsers[1].userId, expectedResult.data.appUsers[1].userId)
		assert.equal(result.data.appUsers[1].createdAt.toString(), expectedResult.data.appUsers[1].createdAt.toString())
	})

	it("should call getAppUsers endpoint with error", async () => {
		// Arrange
		let id = 93

		let jwt = "0sdfofui239qjß0p23r"
		let url = `${Dav.apiBaseUrl}/app/${id}/users`

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
		let result = await GetAppUsers({
			jwt,
			id
		}) as ApiErrorResponse

		// Assert for the response
		assert.equal(result.status, expectedResult.status)
		assert.equal(result.errors[0].code, expectedResult.errors[0].code)
		assert.equal(result.errors[0].message, expectedResult.errors[0].message)
	})
})