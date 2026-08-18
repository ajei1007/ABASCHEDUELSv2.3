const userEventsForSchedulerPDF = (user, userEventsInput, url) => {
  const sections = Array.isArray(userEventsInput)
    ? userEventsInput
    : [userEventsInput];

  const html = `<html>

<head>
  <title>PDF Title</title>
</head>
<style>
  html {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
  }

  .container {
    padding: 1rem 0;
  }

  h1 {
    text-align: center;
    font-size: 20px;
    margin: 0;
  }

  h2,
  h3 {
    text-align: center;
    font-size: 18px;
    color: #4d53e0;
    margin: 0;
    margin-top: 1rem;
  }

  h3 {
    color: #16365f;
    margin: 0;
    margin-top: 4px;
    font-size: 14px;
  }
  
  .totals-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 4px;
  }
  
  .total-item {
    color: #16365f;
    font-size: 14px;
  }

  p {
    margin: 0;
  }

  .table {
    width: 95%;
    margin: 4px auto;
    display: table;
    border: 1px solid #dee2e6;
    border-right-width: 0px;
    text-align: center;
    margin-top: 1rem;
  }

  .table-body {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .row {
    width: calc(100% / 7);
    border-right: 1px solid #dee2e6;
  }

  .header {
    background-color: white;
    border-bottom: 1px solid #dee2e6;
    padding: 4px;
  }

  .header p {
    font-size: 11px;
    color: #16365f;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .event {
    display: flex;
    justify-content: center;
    flex-direction: column;
    font-size: 11px;
    padding: 4px;
    color: #16365f;
    border-bottom: 1px solid #dee2e6;
    border-bottom-width: 1;
  }

  .event p {
    margin-bottom: 4px;
  }

  .btn-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 14px;
  }
  .btn-primary {
    color: #4d53e0;
    border: 1px solid #4d53e0;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
  }
</style>

<body>
  <div class='container'>
    <h1>Your weekly schedules</h1>
    ${sections
      .map((section) => {
        const sectionTitle = section?.name || user?.label || '';
        const total = section?.total || '0';
        const paidTotal = section?.paidTotal || '0';
        const billableTotal = section?.billableTotal || '0';
        const eventsByDate = section?.eventsByDate || [];
        const isEmployee = section?.hasOwnProperty('paidTotal') && section?.hasOwnProperty('billableTotal');

        return `
        <h2>${sectionTitle}</h2>
        ${isEmployee ? 
          `<div class="totals-container">
            <div class="total-item">Total: ${total} hrs</div>
            <div class="total-item">Paid: ${paidTotal} hrs</div>
            <div class="total-item">Billable: ${billableTotal} hrs</div>
          </div>` 
          : 
          `<h3>${total} hrs.</h3>`
        }
        <!--   Table   -->
        <div class="table">
          <div class="table-body">
            ${eventsByDate?.length
              ? eventsByDate
                  .map(
                    (ev, index) => `
              <div class="row" id="${index}">
                <div class="header">
                  <p>${ev.weekdayTitle}</p>
                  <p>${ev.weekdayDate}</p>
                </div>
                <div class="events">
                ${ev.events
                        .map(
                          (event) => `
                  <div class="event" style="border-bottom: 1px solid #dee2e6; color: ${event.activityColor || '#16365f'};">
                  ${event.users.length > 0
                              ? event.users.map((u) => `<p class="user">${u}</p>`).join('')
                              : ''
                            }
                    <p class="user">${event.time}</p>
                    ${event.location ? `<p class="user">${event.location}</p>` : ''}
                    ${event.notes ? `<p class="user">"${event.notes}"</p>` : ''}
                  </div>
                `,
                        )
                        .join('')}
                </div>
              </div>
              `,
                  )
                  .join('')
              : ''
            }
          </div>
        </div>
        <div style="height: 10px"></div>
        `;
      })
      .join('')}
    ${url
      ? `<div class='btn-container'>
      <a class="btn-primary" href="${url}" target="_blank">Confirm All</a>
    </div>`
      : ''
    }
  </div>
</body>

</html>
  `;
  return html;
};

const userSchedulesContents = (message, url) => {
  const html = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Send Email</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap');

        body {
            margin: 0;
            padding: 0;
            font-family: "Poppins", Arial, sans-serif;
        }

        table {
            border-spacing: 0;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }

        p {
            font-family: "Poppins", Arial, sans-serif;
            color: rgba(0, 0, 0, 0.6);
        }

        a {
            font-family: "Poppins", Arial, sans-serif;
        }

        h3 {
            font-family: "Poppins", Arial, sans-serif;
            font-weight: 500;
        }

        .wrapper {
            table-layout: fixed;
            padding-top: 30px;
            padding-bottom: 30px;
            background-color: #ebedf3;
            width: 100%;
            text-align: center;
        }

        .main {
            width: 100%;
            max-width: 600px;
            font-family: "Poppins", Arial, sans-serif;
            color: #4a4a4a;
            text-align: center;
            margin: 5em auto;
            padding: 2em;
            background-color: #FFFFFF;
            border-radius: 0.5em;
            box-shadow: 2px 3px 7px 2px rgba(0, 0, 0, 0.02);
        }

        .mainContainer {
            text-align: center;
        }

        @media (max-width: 700px) {
            .wrapper {
                padding-top: 0;
            }

            .main {
                width: auto;
                margin: 0 auto;
            }
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%" border="0" cellspacing="0" cellpadding="0">
            <!-- Logo and link -->
            <tr class="mainContainer">
                <td align="center" style="padding: 20px 0; padding-top: 0px;">
                    <a href="https://abaschedules.com/">
                        <img src="https://fcsckcm.stripocdn.email/content/guids/72d46a46-fafd-46d0-848b-9f3c296ae2d1/images/logo192.png" alt="ABA Schedules" width="100" />
                    </a>
                </td>
            </tr>
            <!-- Email content -->
            <tr>
                <td>
                    <table width="100%">
                        <tr>
                            <td>
                                <p style="font-size: 16px; text-align: initial; color: rgb(79, 79, 92); line-height: 22px;">
                                    ${message}
                                </p>
                            </td>
                        </tr>
                        ${url ? `
                        <tr>
                            <td>
                                <p style='color: #939393; font-size: 14px;'>Click the following button to confirm the attached schedules for the week
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 5px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="background-color: #4d53e0; border-radius: 8px; text-align: center;" bgcolor="#3498db">
                                            <a href="${url}" target="_blank" style="font-size: 14px; font-weight: 400; color: #ffffff; text-decoration: none; display: inline-block; padding: 12px 20px;">
                                                Confirm All</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

      `;
  return html;
};

module.exports = {
  userEventsForSchedulerPDF,
  userSchedulesContents,
};

