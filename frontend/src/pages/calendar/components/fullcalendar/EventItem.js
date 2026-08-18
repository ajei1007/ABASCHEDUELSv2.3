function renderItem(eventInfo) {
  const time = eventInfo?.timeText ?? '';
  const visible = eventInfo?.event?.extendedProps?.visible ?? false;
  const qaId = `calendar-event-title`;
  if (
    eventInfo?.event.display !== 'background' &&
    eventInfo?.event.extendedProps.users
  ) {
    // const targetElement = document.querySelector(`.event-id-${eventInfo?.event?.id}`);
    // if (targetElement) {
    //   const closest = targetElement.closest(".fc-resource");
    //   if (closest) {
    //     const resourceId = closest.getAttribute('data-resource-id');

    //     // Making Event Title
    //     let names = [];
    //     const eventUsers = eventInfo?.event?.extendedProps?.users;
    //     if (eventUsers) {
    //       eventUsers.forEach((id, index) => {
    //         if (id !== resourceId) {
    //           names.push(eventInfo.event.extendedProps.users_names[index]);
    //         }
    //       });
    //     }
    //     title_new = names.join(' - ');
    //     const notes = eventInfo.event?.extendedProps?.notes;
    //     if (notes) {
    //       title_new = `${title_new} NOTES: ${notes}`;
    //     }
    //   }
    // }
    return {
      html: `
      <div class='fc-event-main-frame' data-qa="${qaId}">
        <div class="fc-event-time">${visible ? '*' : ''}${time}</div>
        <div class="fc-event-title-container">
          <div class="fc-event-title">
            ${eventInfo.event?.title}
      </div>
      `,
    };
  } else if (eventInfo?.event.display !== 'background') {
    return {
      html: `
      <div class='fc-event-main-frame' data-qa="${qaId}">
        <div class="fc-event-time">${time}</div>
        <div class="fc-event-title-container">
          <div class="fc-event-title">
          ${eventInfo.event?.title}
          </div>
        </div>
      </div>
      `,
    };
  }
  return true;
}

export default renderItem;
