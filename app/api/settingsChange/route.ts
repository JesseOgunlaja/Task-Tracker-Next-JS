const nodemailer = require("nodemailer");
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
import { cookies } from "next/headers";
import { z } from "zod";
import { User, getByEmail, getByName, redis } from "@/utils/redis";

function convertDateFormat(
  dateString: string,
  user: any,
  body: any,
  showTime: boolean
) {
  const currentFormat = user?.settings.dateFormat;
  const targetFormat = body?.dateFormat;

  if (!currentFormat || !targetFormat) {
    throw new Error("Current or target date format missing");
  }

  const parts = dateString.split(/[ /-]/);
  const currentPartsOrder = currentFormat.split(/[/-]/);

  const dayIndex = currentPartsOrder.indexOf("dd");
  const monthIndex = currentPartsOrder.indexOf("MM");
  const yearIndex = currentPartsOrder.indexOf("yyyy");

  const day = parseInt(parts[dayIndex], 10);
  const month = parseInt(parts[monthIndex], 10) - 1;
  const year = parseInt(parts[yearIndex], 10);

  const targetPartsOrder = targetFormat.split(/[/-]/);

  let formattedDate = "";
  targetPartsOrder.forEach((part: any) => {
    if (part === "dd") {
      formattedDate += day.toString().padStart(2, "0");
    } else if (part === "MM") {
      formattedDate += (month + 1).toString().padStart(2, "0");
    } else if (part === "yyyy") {
      formattedDate += year.toString();
    } else {
      throw new Error("Invalid date format");
    }
    formattedDate += targetFormat.includes("-") ? "-" : "/";
  });

  formattedDate = formattedDate.slice(0, -1);
  if (showTime) {
    if (dateString.includes(" ")) {
      formattedDate += ` ${dateString.split(" ")[1]}`;
    }
  }

  return formattedDate;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const requestHeaders = headers();
    const id = requestHeaders.get("id");

    const user = (await redis.hgetall(String(id))) as User;

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    } else {
      const gmailUser = user.password === "GMAIL";
      const updateFields: any = {};
      if (body.name) {
        const result = usernameSchema.safeParse(body.name);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          const name = body.name;
          if (user.name === name.toUpperCase()) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            const duplicateUser = await getByName(name.toUpperCase());
            if (duplicateUser == null) {
              updateFields.name = body.name.toUpperCase();
            } else {
              return NextResponse.json(
                { message: "Duplicate" },
                { status: 400 }
              );
            }
          }
        }
      }
      if (body.email) {
        if (gmailUser) {
          return NextResponse.json(
            {
              message:
                "Can't change email for Google Account unless you use the designated change Google email route",
            },
            { status: 400 }
          );
        }
        const result = emailSchema.safeParse(body.email);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          const email = body.email;
          console.log(user.email, email);
          if (user.email === email.toLowerCase()) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            const duplicateUser = await getByEmail(email.toLowerCase());
            if (duplicateUser == null) {
              if (body.createMagicLink) {
                const uuid = uuidv4();
                await fetch(
                  `${process.env.REDIS_URL}/set/${email.toLowerCase()}/${
                    String(uuid) + " " + id
                  }/EX/86400`,
                  {
                    headers: {
                      authorization: `Bearer ${process.env.REDIS_TOKEN}`,
                    },
                  }
                );
                const url = `${
                  request.nextUrl.origin
                }/changeEmailMagicLink?email=${encodeURIComponent(
                  email
                )}&code=${encodeURIComponent(uuid)}`;
                const transporter = nodemailer.createTransport({
                  host: "smtp.hostinger.com",
                  secure: true,
                  auth: {
                    user: "admin@taskmasterapp.com",
                    pass: process.env.GMAIL_PASSWORD,
                  },
                });

                const mailOptions = {
                  from: "admin@taskmasterapp.com",
                  to: body.email,
                  subject: "TaskMaster: Verify email",
                  html: `<!DOCTYPE html>
                  <html>
                  <head>
                  
                    <meta charset="utf-8">
                    <meta http-equiv="x-ua-compatible" content="ie=edge">
                    <title>Email Confirmation</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style type="text/css">
                    /**
                     * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
                     */
                    @media screen {
                      @font-face {
                        font-family: 'Source Sans Pro';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
                      }
                      @font-face {
                        font-family: 'Source Sans Pro';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
                      }
                    }
                    /**
                     * Avoid browser level font resizing.
                     * 1. Windows Mobile
                     * 2. iOS / OSX
                     */
                    body,
                    table,
                    td,
                    a {
                      -ms-text-size-adjust: 100%; /* 1 */
                      -webkit-text-size-adjust: 100%; /* 2 */
                    }
                    /**
                     * Remove extra space added to tables and cells in Outlook.
                     */
                    table,
                    td {
                      mso-table-rspace: 0pt;
                      mso-table-lspace: 0pt;
                    }
                    /**
                     * Better fluid images in Internet Explorer.
                     */
                    img {
                      -ms-interpolation-mode: bicubic;
                    }
                    /**
                     * Remove blue links for iOS devices.
                     */
                    a[x-apple-data-detectors] {
                      font-family: inherit !important;
                      font-size: inherit !important;
                      font-weight: inherit !important;
                      line-height: inherit !important;
                      color: inherit !important;
                      text-decoration: none !important;
                    }
                    /**
                     * Fix centering issues in Android 4.4.
                     */
                    div[style*="margin: 16px 0;"] {
                      margin: 0 !important;
                    }
                    body {
                      width: 100% !important;
                      height: 100% !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    /**
                     * Collapse table borders to avoid space between cells.
                     */
                    table {
                      border-collapse: collapse !important;
                    }
                    a {
                      color: #1a82e2;
                    }
                    img {
                      height: auto;
                      line-height: 100%;
                      text-decoration: none;
                      border: 0;
                      outline: none;
                    }
                    </style>
                  
                  </head>
                  <body style="background-color: #e9ecef;">
                  
                    <!-- start preheader -->
                    <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
                      Verify your email address
                    </div>
                    <!-- end preheader -->
                  
                    <!-- start body -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  
                      <br/>
                  
                      <!-- start hero -->
                      <tr>
                        <td align="center" bgcolor="#e9ecef">
                          <!--[if (gte mso 9)|(IE)]>
                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                          <tr>
                          <td align="center" valign="top" width="600">
                          <![endif]-->
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                              <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                                <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Confirm Your Email Address</h1>
                              </td>
                            </tr>
                          </table>
                          <!--[if (gte mso 9)|(IE)]>
                          </td>
                          </tr>
                          </table>
                          <![endif]-->
                        </td>
                      </tr>
                      <!-- end hero -->
                  
                      <!-- start copy block -->
                      <tr>
                        <td align="center" bgcolor="#e9ecef">
                          <!--[if (gte mso 9)|(IE)]>
                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                          <tr>
                          <td align="center" valign="top" width="600">
                          <![endif]-->
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  
                            <!-- start copy -->
                            <tr>
                              <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                <p style="margin: 0;">Tap the button below to confirm your email address. If you didn't create an account with <a href="https://taskmasterapp.com">TaskMaster</a>, you can safely delete this email.<br/><strong>This link expires in 24 hours.</strong></p>
                              </td>
                            </tr>
                            <!-- end copy -->
                  
                            <!-- start button -->
                            <tr>
                              <td align="left" bgcolor="#ffffff">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                    <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                                      <table border="0" cellpadding="0" cellspacing="0">
                                        <tr>
                                          <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                            <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify email</a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <!-- end button -->
                  
                            <!-- start copy -->
                            <tr>
                              <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                                <p style="margin: 0;"><a href="${url}" target="_blank">${url}</a></p>
                              </td>
                            </tr>
                            <!-- end copy -->
                  
                          </table>
                          <!--[if (gte mso 9)|(IE)]>
                          </td>
                          </tr>
                          </table>
                          <![endif]-->
                        </td>
                      </tr>
                      <!-- end copy block -->
                  
                      <!-- start footer -->
                      <tr>
                        <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                          <!--[if (gte mso 9)|(IE)]>
                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                          <tr>
                          <td align="center" valign="top" width="600">
                          <![endif]-->
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  
                            <!-- start permission -->
                            <tr>
                              <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                                <p style="margin: 0;">You received this email because we received a request to change the email registered with your account. If you didn't request this you can safely delete this email.</p>
                              </td>
                            </tr>
                            <!-- end permission -->
                  
                          </table>
                          <!--[if (gte mso 9)|(IE)]>
                          </td>
                          </tr>
                          </table>
                          <![endif]-->
                        </td>
                      </tr>
                      <!-- end footer -->
                  
                    </table>
                    <!-- end body -->
                  
                  </body>
                  </html>`,
                };

                try {
                  await transporter.sendMail(mailOptions);
                  return NextResponse.json(
                    { message: `Message sent succesfully` },
                    { status: 200 }
                  );
                } catch (error) {
                  return new Response(`${error}`, { status: 500 });
                }
              } else {
                if (body.code == undefined) {
                  return NextResponse.json(
                    { message: "Code not found" },
                    { status: 400 }
                  );
                }
                const CODE = (await redis.get(body.email)) as string;
                if (CODE == undefined) {
                  return NextResponse.json(
                    { message: "Code expired" },
                    { status: 400 }
                  );
                }
                if (CODE.split(" ")[0] !== body.code) {
                  return NextResponse.json(
                    { message: "Invalid code" },
                    { status: 400 }
                  );
                }
                await redis.del(body.email);
                if (user.name === user.email || user.name.includes("@")) {
                  updateFields.name = body.email.toLowerCase();
                }
                updateFields.email = body.email.toLowerCase();
              }
            } else {
              return NextResponse.json(
                { message: "Duplicate" },
                { status: 400 }
              );
            }
          }
        }
      }
      if (
        body.newPassword &&
        body.oldPassword &&
        body.deleteSessions != undefined
      ) {
        if (gmailUser) {
          return NextResponse.json(
            { message: "Can't change password for Google account" },
            { status: 400 }
          );
        }
        if (await bcrypt.compare(body.oldPassword, user.password)) {
          const result = passwordSchema.safeParse(body.newPassword);
          if (!result.success) {
            return NextResponse.json(
              { message: result.error.format()._errors },
              { status: 400 }
            );
          } else {
            if (body.newPassword === body.oldPassword) {
              return NextResponse.json({ message: "Same" }, { status: 400 });
            } else {
              if (body.deleteSessions === true) {
                const uuid = uuidv4();
                updateFields.uuid = uuid;
              }
              updateFields.password = await bcrypt.hash(body.newPassword, 10);
            }
          }
        } else {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 }
          );
        }
      }
      if (body.twoFactorAuth != undefined) {
        if (gmailUser) {
          return NextResponse.json(
            { message: "Can't change two factor auth for Google account" },
            { status: 400 }
          );
        }
        const schema = z.boolean();
        const result = schema.safeParse(body.twoFactorAuth);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          if (body.twoFactorAuth === user.settings.twoFactorAuth) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            const currentSettings = user.settings;
            currentSettings.twoFactorAuth = body.twoFactorAuth;
            updateFields.settings = currentSettings;
          }
        }
      }
      if (body.timeFormat) {
        const timeFormatSchema = z.union([z.literal(12), z.literal(24)]);
        const result = timeFormatSchema.safeParse(body.timeFormat);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          if (body.timeFormat === user.settings.timeFormat) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            const currentSettings = user.settings;
            currentSettings.timeFormat = body.timeFormat;
            updateFields.settings = currentSettings;
          }
        }
      }
      if (body.calendars) {
        const calendarsSchema = z.array(
          z.string().min(1, {
            message: "Calendar can't be empty string",
          })
        );
        const result = calendarsSchema.safeParse(body.calendars);
        if (!result.success) {
          const error = result.error.issues.map((issue) => {
            return { error: issue.message };
          });
          return NextResponse.json({ errors: error }, { status: 400 });
        } else {
          if (
            JSON.stringify(body.calendars) ===
            JSON.stringify(user.settings.calendars)
          ) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            if (body.calendars.length === user.settings.calendars.length) {
              const newProjects = user.projects.map((project: any) => {
                const indexOfSection = user.settings.calendars.indexOf(
                  project.type
                );
                project.type = body.calendars[indexOfSection];
                return project;
              });
              updateFields.projects = newProjects;
            }
            if (
              user.projects.filter((val: any) =>
                body.calendars.includes(val.type)
              ).length !== user.projects.length
            ) {
              return NextResponse.json(
                {
                  message: "Remove all projects with type before removing tag",
                },
                { status: 400 }
              );
            }
            const currentSettings = user.settings;
            currentSettings.calendars = body.calendars;
            updateFields.settings = currentSettings;
          }
        }
      }
      if (body.dateFormat) {
        const dateFormatSchema = z.union([
          z.literal("yyyy-MM-dd"),
          z.literal("MM/dd/yyyy"),
          z.literal("dd/MM/yyyy"),
        ]);
        const result = dateFormatSchema.safeParse(body.dateFormat);
        if (!result.success) {
          return NextResponse.json(
            { message: "Invalid input" },
            { status: 400 }
          );
        } else {
          if (body.dateFormat === user.settings.dateFormat) {
            return NextResponse.json({ message: "Same" }, { status: 400 });
          } else {
            const newProjects = user.projects.map((project: any) => {
              project.date = convertDateFormat(project.date, user, body, false);
              project.tasks = project.tasks.map((task: any) => {
                task.date = convertDateFormat(task.date, user, body, true);
                return task;
              });
              return project;
            });
            updateFields.projects = newProjects;
            const currentSettings = user.settings;
            currentSettings.dateFormat = body.dateFormat;
            updateFields.settings = currentSettings;
          }
        }
      }
      if (body.googleCode) {
        if (user.password !== "GMAIL") {
          return NextResponse.json(
            { message: "Invalid route" },
            { status: 400 }
          );
        }
        const googleJWT = body.googleCode;
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${googleJWT}` },
          }
        );
        const data = await res.json();
        const email = data.email.toLowerCase();
        if (user.email === email) {
          return NextResponse.json({ message: "Same" }, { status: 400 });
        }
        const duplicateUser = await getByEmail(email.toLowerCase());
        if (duplicateUser == null) {
          if (user.name.toLowerCase() === user.email.toLowerCase()) {
            updateFields.name = email;
          }
          updateFields.email = email;
        } else {
          return NextResponse.json({ message: "Duplicate" }, { status: 400 });
        }
      }

      console.log(String(id));
      console.log(updateFields);
      await redis.hset(String(id), updateFields);

      const uuid = updateFields.uuid || user.uuid;

      const payload = {
        iat: Date.now(),
        exp: Math.floor(
          (new Date().getTime() + 30 * 24 * 60 * 60 * 1000) / 1000
        ),
        username: updateFields.name || user.name,
        email: updateFields.email || user.email,
        id: id,
        uuid: uuid,
      };
      const names: any[] = (
        await redis.lrange("Username and emails", 0, -1)
      ).map((val) => (val as unknown as Record<string, unknown>)?.name);

      await redis.lset(
        "Username and emails",
        names.indexOf(user.name),
        JSON.stringify({
          name: updateFields.name || user.name,
          email: updateFields.email || user.email,
          id: String(id),
        })
      );
      const token = jwt.sign(payload, process.env.SECRET_KEY);
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + 2592000);
      cookies().set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: expirationDate,
      });

      if (body.createMagicLink != undefined && body.createMagicLink == false) {
        return NextResponse.json(
          {
            user: { ...updateFields },
            oldEmail: user.email,
            message: "Success",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { user: updateFields, message: "Success" },
          { status: 200 }
        );
      }
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Error", error: `${err}` },
      { status: 500 }
    );
  }
}
