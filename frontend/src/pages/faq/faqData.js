export const faqData = [
  {
    question: "I do not want everyone seeing when I am editing the schedule, can I turn off the live updates?",
    answer: [
      "1. Turn the **toggle on** for **‘sandbox mode’**—only you will be able to see the changes you are making until you take those appointments out of sandbox mode.",
      "2. **Click an appointment** and then at the **bottom** of the pop-up, there will be a **toggle** to take the appointment out of **sandbox mode**.",
      "3. If you need to take **multiple appointments** out of sandbox mode, **check the names** with the **sandbox appointments**.",
      "4. A button will appear at the **top** next to the copy and paste button labeled **‘Make Unsandboxed’**.",
      "5. Click **‘Make Unsandboxed’**—the appointments will then be live for everyone to see."
    ],
    videoUrl: "https://www.youtube.com/embed/jT_QQ2ywCvc?si=cU1JS8TCRy9sOV_V"
  },

  {
    question: "The solution generator is not generating anything for an employee, how do I troubleshoot?",
    answer: [
      "1. Did you recently **change this employee's role?** The solution generator is based on the **roles**. We can always add in a role, if needed.",
      "2. Did you add in a **new constraint?** If so, try making that constraint a **‘soft constraint’** and **turn on** your **orange solutions** to see if there are solutions under that employee. The constraint may have been entered wrong.",
      "3. Do you have a **capacity constraint** created for the activity?",
      "4. Does this **employee** have **availability** on this day?",
      "5. Does the **activity** have **availability?**",
      "6. Is the solution generator working on other days? Other clients?",
      "7. These questions will help us pinpoint if it is a user error or something our developers may need to take a quick look at."
    ],
    // videoUrl: "https://www.youtube.com/embed/D02LW8qYQmM?si=t9W97Qd-HIRBd3tE" Wrong video link
  },

  {
    question: "How do I change the color on the schedule to reflect an employee, not an activity?",
    answer: [
      "1. All of the colors are customizable.",
      "2. In each **profile**, you have the ability to customize the background colors and the border color for an activity or user.",
      "3. When looking at a session, the **colors of the session** and the **border** can mean **two different things**.",
      "4. This is **edited** in the **settings** where the dropdowns say **‘background color role’** and **‘border color role’**."
    ],
    // videoUrl: "https://youtu.be/t37AaaD3m6k" Video was taken down
  },

  {
    question: "How to make a group or team",
    answer: [
      "1. Find the **constraint tab** on the **left side** of the screen.",
      "2. **Click on it** and then click the **‘groups’** tab.",
      "3. **Create a group** and add what kind of users will belong to that group (e.g., clients, RBTs, or both).",
      "4. **Click save**. **Refresh the screen**, and you should see the group show up under the tags.",
      "5. Create the RBT or client team/tags under that group.",
      "6. Go back up to the constraint tab and **click** the **‘custom’** tab.",
      "7. Select **‘group’** for the constraint type.",
      "8. Choose the **branch** that it applies to.",
      "9. **Choose** ‘team’ (or **the name you gave your group**) for the grouping.",
      "10. On the **left**, select **‘role’** and then **‘RBT’** for the role.",
      "11. On the **right**, select **‘role’** and then **‘client’** for the role.",
      "12. This constraint will apply to all teams you create under that group in the future."
    ],
    videoUrl: "https://www.youtube.com/embed/Fddy0h_BAKU?si=_BxoSTc-Qo_rq9q1"
  },

  {
    question: "Can I add a future client into the system?",
    answer: [
      "1. **Yes!** In the **availability section** of the **client's profile**, there is the ability to set the **start range** to whatever date you would like.",
      "2. This allows you to go out several weeks to plan ahead without affecting your current schedule’s efficiency."
    ],
    videoUrl: "https://www.youtube.com/embed/8uS_Pq8hR-o?si=rFOW2KohsSRc9de8"
  }
];
