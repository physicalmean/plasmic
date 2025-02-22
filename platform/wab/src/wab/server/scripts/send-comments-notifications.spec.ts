import { DbMgr } from "@/wab/server/db/DbMgr";
import { Project, User } from "@/wab/server/entities/Entities";
import {
  getNotificationComment,
  processUnnotifiedCommentsNotifications,
} from "@/wab/server/scripts/send-comments-notifications";
import { withDb } from "@/wab/server/test/backend-util";
import { Connection } from "typeorm";

async function postComment(
  dbManager: DbMgr,
  projectId: string,
  threadId?: string
) {
  const comment = threadId
    ? await dbManager.postCommentInThread(
        { projectId },
        { body: "reply text", threadId }
      )
    : await dbManager.postRootCommentInProject(
        { projectId },
        {
          body: "comment text",
          location: { subject: { uuid: "", iid: "" }, variants: [] },
        }
      );
  return (
    (await dbManager.getCommentsForThread(comment.commentThreadId)).find(
      (tc) => tc.id === comment.id
    ) || comment
  );
}

async function setupNotifications(
  mgr: DbMgr,
  userMgrs: (() => DbMgr)[],
  users: User[],
  project: Project
) {
  // Add users to project
  await userMgrs[0]().grantProjectPermissionByEmail(
    project.id,
    users[1].email,
    "editor"
  );
  await userMgrs[0]().grantProjectPermissionByEmail(
    project.id,
    users[2].email,
    "editor"
  );

  await userMgrs[0]().updateNotificationSettings(users[0].id, project.id, {
    notifyAbout: "all",
  });
  await userMgrs[1]().updateNotificationSettings(users[1].id, project.id, {
    notifyAbout: "all",
  });
  await userMgrs[2]().updateNotificationSettings(users[2].id, project.id, {
    notifyAbout: "all",
  });
}

async function withEndUserNotificationSetup(
  f: (args: {
    sudo: DbMgr;
    dbCon: Connection;
    users: User[];
    project: Project;
    userDbs: (() => DbMgr)[];
  }) => Promise<void>
) {
  await withDb(async (sudo, users, userDbs, project, em) => {
    await setupNotifications(sudo, userDbs, users, project);

    await f({
      sudo,
      users,
      dbCon: em.connection,
      project,
      userDbs,
    });
  });
}

describe("sendCommentsNotificationEmails", () => {
  it("should send notifications based on user settings", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        // user 0 comment
        const user0comment = await postComment(userDbs[0](), project.id);

        // User 1 comment
        const user1Comment = await postComment(userDbs[1](), project.id);

        // User 1 reply to user 0 comment
        const user1ReplyToUser0Comment = await postComment(
          userDbs[1](),
          project.id,
          user0comment.commentThreadId
        );

        const { notificationsByUser, recentCommentThreads } =
          await processUnnotifiedCommentsNotifications(sudo);

        // Check if the notificationsByUser structure is correct
        expect(notificationsByUser).toEqual(
          new Map([
            [
              users[0].id,
              {
                userEmail: users[0].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user1ReplyToUser0Comment.commentThreadId,
                          [
                            getNotificationComment(user0comment),
                            getNotificationComment(user1ReplyToUser0Comment),
                          ],
                        ],
                        [
                          user1Comment.commentThreadId,
                          [getNotificationComment(user1Comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
            [
              users[1].id,
              {
                userEmail: users[1].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0comment.commentThreadId,
                          [getNotificationComment(user0comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
            [
              users[2].id,
              {
                userEmail: users[2].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0comment.commentThreadId,
                          [getNotificationComment(user0comment)],
                        ],
                        [
                          user1Comment.commentThreadId,
                          [getNotificationComment(user1Comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
          ])
        );

        // Check if the processed comments match the recentComments
        expect(recentCommentThreads).toEqual([
          user0comment.commentThreadId,
          user1Comment.commentThreadId,
        ]);
      }
    );
  });
  it("should not notify user about replies to their own comment", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        // user 0 comment
        const user0comment = await postComment(userDbs[0](), project.id);

        // user 1 comment
        const user1Comment = await postComment(userDbs[1](), project.id);

        // User 0 replies to their own comment
        const user0Reply = await postComment(
          userDbs[0](),
          project.id,
          user0comment.commentThreadId
        );

        const { notificationsByUser, recentCommentThreads } =
          await processUnnotifiedCommentsNotifications(sudo);

        // Expect user 0 not to be notified about their own reply
        expect(notificationsByUser).toEqual(
          new Map([
            [
              users[0].id,
              {
                userEmail: users[0].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user1Comment.commentThreadId,
                          [getNotificationComment(user1Comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
            [
              users[1].id,
              {
                userEmail: users[1].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0comment.commentThreadId,
                          [getNotificationComment(user0comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
            [
              users[2].id,
              {
                userEmail: users[2].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0comment.commentThreadId,
                          [getNotificationComment(user0comment)],
                        ],
                        [
                          user1Comment.commentThreadId,
                          [getNotificationComment(user1Comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
          ])
        );

        // Check if the processed comments match the recentComments
        expect(recentCommentThreads).toEqual([
          user0comment.commentThreadId,
          user1Comment.commentThreadId,
        ]);
      }
    );
  });

  it("should only notify user with 'mentions-and-replies' preference about replies to their comments or replies after they replied", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        // Set user 1's preference to 'mentions-and-replies'
        await sudo.updateNotificationSettings(users[1].id, project.id, {
          notifyAbout: "mentions-and-replies",
        });

        // user 0 comment
        const user0comment = await postComment(userDbs[0](), project.id);

        // user 0 selfReply
        // user 1 should not be notified for this because user 1 has not yet responded
        const user0SelfReply = await postComment(
          userDbs[0](),
          project.id,
          user0comment.commentThreadId
        );

        // User 1 comment
        const user1Comment = await postComment(userDbs[1](), project.id);

        // User 1 reply to user 0 comment
        const user1ReplyToUser0Comment = await postComment(
          userDbs[1](),
          project.id,
          user0comment.commentThreadId
        );

        // user 0 replied to user 1 comment should be notified
        const user0Replied = await postComment(
          userDbs[0](),
          project.id,
          user1Comment.commentThreadId
        );

        const { notificationsByUser, recentCommentThreads } =
          await processUnnotifiedCommentsNotifications(sudo);

        // User 1 should not be notified about the comment and reply from user 1 on thread1
        expect(
          notificationsByUser
            .get(users[1].id)
            ?.projects.get(project.id)
            ?.threads.get(user0comment.commentThreadId)
        ).toBeUndefined();
        expect(
          notificationsByUser
            .get(users[1].id)
            ?.projects.get(project.id)
            ?.threads.get(user1Comment.commentThreadId)?.length
        ).toBe(2);

        // Check if the processed comments match the recentComments
        expect(recentCommentThreads).toEqual([
          user0comment.commentThreadId,
          user1Comment.commentThreadId,
        ]);
      }
    );
  });
  it("should not notify user with 'none' notification preference", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        // Set user 0's preference to 'none'
        await sudo.updateNotificationSettings(users[0].id, project.id, {
          notifyAbout: "none",
        });

        // user 0 comment
        const user0comment = await postComment(userDbs[0](), project.id);

        // user 1 comment
        const user1Comment = await postComment(userDbs[1](), project.id);

        // user 1 reply to user 0 comment
        const user1Reply = await postComment(
          userDbs[1](),
          project.id,
          user0comment.commentThreadId
        );

        // user 0 should not be notified about the comment
        const { notificationsByUser, recentCommentThreads } =
          await processUnnotifiedCommentsNotifications(sudo);

        // Check that user 0 has no notifications and no 'projects' entry
        expect(notificationsByUser.get(users[0].id)).toBeUndefined();

        // User 1 should have notifications
        expect(notificationsByUser.get(users[1].id)).toEqual({
          userEmail: users[1].email,
          projects: new Map([
            [
              project.id,
              {
                projectName: project.name,
                threads: new Map([
                  [
                    user0comment.commentThreadId,
                    [getNotificationComment(user0comment)],
                  ],
                ]),
              },
            ],
          ]),
        });

        // Check if the processed comments match the recentComments
        expect(recentCommentThreads).toEqual([
          user0comment.commentThreadId,
          user1Comment.commentThreadId,
        ]);
      }
    );
  });
  it("should not notify user about the same comment once notified", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        // Post a comment (user 0)
        const user0comment = await postComment(userDbs[0](), project.id);

        // Post another comment (user 1)
        const user1Comment = await postComment(userDbs[1](), project.id);

        // Post a reply (user 1)
        const user1Reply = await postComment(
          userDbs[1](),
          project.id,
          user0comment.commentThreadId
        );

        // Process notifications and send out emails
        const { notificationsByUser, recentCommentThreads } =
          await processUnnotifiedCommentsNotifications(sudo);

        // Ensure that user 0 is notified about the first comment
        expect(notificationsByUser).toEqual(
          new Map([
            [
              users[0].id,
              {
                userEmail: users[0].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0comment.commentThreadId,
                          [
                            getNotificationComment(user0comment),
                            getNotificationComment(user1Reply),
                          ],
                        ],
                        [
                          user1Comment.commentThreadId,
                          [getNotificationComment(user1Comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
            [
              users[1].id,
              {
                userEmail: users[1].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0comment.commentThreadId,
                          [getNotificationComment(user0comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
            [
              users[2].id,
              {
                userEmail: users[2].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0comment.commentThreadId,
                          [getNotificationComment(user0comment)],
                        ],
                        [
                          user1Comment.commentThreadId,
                          [getNotificationComment(user1Comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
          ])
        );

        // Check the recentComments array (it should include user0comment, user1Comment, and user0Reply)
        expect(recentCommentThreads).toEqual([
          user0comment.commentThreadId,
          user1Comment.commentThreadId,
        ]);

        // Simulate sending notifications, after which the comments should be marked as notified
        // You can either mark them as notified in the system or simulate this in your mock logic
        await sudo.markCommentsAsNotified([
          user0comment.commentThreadId,
          user1Comment.commentThreadId,
          user1Reply.commentThreadId,
        ]);

        // Process notifications again after the comments have been notified
        const { notificationsByUser: secondNotificationCheck } =
          await processUnnotifiedCommentsNotifications(sudo);

        // Check that user 0 has no notifications and no 'projects' entry
        expect(secondNotificationCheck.get(users[0].id)).toBeUndefined();
        expect(secondNotificationCheck.get(users[1].id)).toBeUndefined();
      }
    );
  });
  it("should handle mixed notification preferences correctly", async () => {
    await withEndUserNotificationSetup(
      async ({ sudo, users, project, userDbs }) => {
        // Set notification preferences for users
        await sudo.updateNotificationSettings(users[1].id, project.id, {
          notifyAbout: "mentions-and-replies",
        }); // Notify only for mentions and replies
        await sudo.updateNotificationSettings(users[2].id, project.id, {
          notifyAbout: "none",
        }); // Do not notify at all

        // user 0 posts a comment
        const user0Comment = await postComment(userDbs[0](), project.id);

        // user 1 replies to user 0's comment
        const user1Reply = await postComment(
          userDbs[1](),
          project.id,
          user0Comment.commentThreadId
        );

        // user 1 posts a comment
        const user1Comment = await postComment(userDbs[1](), project.id);

        // user 2 replies to user 1's comment
        const user2Reply = await postComment(
          userDbs[2](),
          project.id,
          user1Comment.commentThreadId
        );

        // Process notifications
        const { notificationsByUser, recentCommentThreads } =
          await processUnnotifiedCommentsNotifications(sudo);

        // Validate notifications
        expect(notificationsByUser).toEqual(
          new Map([
            [
              users[0].id,
              {
                userEmail: users[0].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user0Comment.commentThreadId,
                          [
                            getNotificationComment(user0Comment),
                            getNotificationComment(user1Reply),
                          ],
                        ],
                        [
                          user1Comment.commentThreadId,
                          [getNotificationComment(user1Comment)],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
            [
              users[1].id,
              {
                userEmail: users[1].email,
                projects: new Map([
                  [
                    project.id,
                    {
                      projectName: project.name,
                      threads: new Map([
                        [
                          user1Comment.commentThreadId,
                          [
                            getNotificationComment(user1Comment),
                            getNotificationComment(user2Reply),
                          ],
                        ],
                      ]),
                    },
                  ],
                ]),
              },
            ],
          ])
        );

        // Validate that user 2 receives no notifications
        expect(notificationsByUser.get(users[2].id)).toBeUndefined();

        // Validate processed comments
        expect(recentCommentThreads).toEqual([
          user0Comment.commentThreadId,
          user1Comment.commentThreadId,
        ]);
      }
    );
  });
});
