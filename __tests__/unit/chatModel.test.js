process.env.NODE_ENV = "test";
const Chat = require("../../models/chatModel");
console.error = jest.fn();

const {
	TEST_DATA,
	afterEachHook,
	afterAllHook,
	beforeAllHook,
	beforeEachHook,
} = require("../../testConfig");

describe("test Chat Model", () => {
	beforeAll(async function () {
		await beforeAllHook();
	});

	beforeEach(async function () {
		await beforeEachHook(TEST_DATA);
	});

	let random_num = (num = 100) => {
		return Math.floor(Math.random() * num);
	};

	describe("Chat.create()", () => {
		let chat;
		beforeEach(function () {
			let num = random_num();
			chat = {
				project_id: `${TEST_DATA.completedProject1.id}`,
				user_id: `${TEST_DATA.completedProject1.user_id}`,
				comment: `comment ${num}`,
				user_type: "user",
			};
		});

		it("creates a new Chat", async () => {
			let resp = await Chat.create(chat);
			expect(resp).toHaveProperty("id");
			expect(Object.keys(resp)).toHaveLength(6);
		});

		it("returns destructure TypeError if no values are provided", async () => {
			try {
				await Chat.create();
			} catch (error) {
				expect(error.message).toEqual(
					`Cannot destructure property 'project_id' of 'undefined' as it is undefined.`
				);
			}
		});
	});

	describe("Chat.all()", () => {
		it("gets all chats", async () => {
			let resp = await Chat.all();
			expect(resp[0].id).toEqual(TEST_DATA.userChat.id);
		});
	});

	describe("Chat.getProjectChat()", () => {
		it("gets all chats associated with the project for user", async () => {
			let user = {
				user_type: "user",
				id: TEST_DATA.userChat.user_id,
			};
			let resp = await Chat.getProjectChat(
				TEST_DATA.userChat.project_id,
				user
			);

			expect(resp).toHaveLength(2);
			expect(resp[0].comment).toEqual(
				"let me know if there is anything else i can do"
			);
		});

		it("gets all chats associated with the project for tradesman", async () => {
			let user = {
				user_type: "tradesman",
				id: TEST_DATA.tradesmanChat.tradesmen_id,
			};
			let resp = await Chat.getProjectChat(
				TEST_DATA.userChat.project_id,
				user
			);

			expect(resp).toHaveLength(2);
			expect(resp[0].comment).toEqual(
				"let me know if there is anything else i can do"
			);
		});

		it("returns an error us user is not associated with the project", async () => {
			let user = {
				user_type: "user",
				id: TEST_DATA.user2.id,
			};
			try {
				await Chat.getProjectChat(TEST_DATA.userChat.project_id, user);
			} catch (error) {
				expect(error.message).toEqual("Unauthorized");
				expect(err.status).toEqual(401);
			}
		});
	});

	describe("Chat.get()", () => {
		it("gets the one created chat by id", async () => {
			let resp = await Chat.get(TEST_DATA.userChat.id);
			expect(resp).toHaveProperty("id");
			expect(Object.keys(resp)).toHaveLength(6);
		});

		it("returns an error if chat can't be found", async () => {
			try {
				await Chat.get(654321);
			} catch (error) {
				expect(error.message).toEqual(`Could not find chat id: 654321`);
			}
		});
	});

	describe("Chat.update()", () => {
		it("updates the one created chat", async () => {
			let chat = await Chat.get(TEST_DATA.userChat.id);
			let updatedChat = await chat.update({
				comment: "updatedComment",
			});
			expect(updatedChat.comment).toEqual("updatedComment");
			expect(Object.keys(updatedChat)).toHaveLength(6);
		});

		it("returns an error if you try to add a chat property which does not exist", async () => {
			let chat = await Chat.get(TEST_DATA.userChat.id);
			try {
				await chat.update({
					newcolumn: true,
				});
			} catch (error) {
				expect(error.message).toEqual(
					`column \"newcolumn\" of relation \"chat\" does not exist`
				);
			}
		});
	});

	describe("Chat.remove()", () => {
		it("deleted the created chat", async () => {
			let resp = await Chat.remove(TEST_DATA.userChat.id);
			expect(resp).toEqual("deleted");
		});

		it("returns an error if chat can't be found", async () => {
			try {
				await Chat.remove(6543210);
			} catch (error) {
				expect(error.message).toEqual(
					`Could not find chat id: 6543210`
				);
			}
		});
	});

	afterEach(async function () {
		await afterEachHook();
	});

	afterAll(async function () {
		await afterAllHook();
	});
});
