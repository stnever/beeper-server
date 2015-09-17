This is the planned feature roadmap for Beeper:

  * Generate Github-like identicons and use them as 'portraits' when
    a source is first created.
  * Allow admins to change a source's portrait.
  * Allow an admin to enable Chrome Desktop Notifications for certain
    sources or channels.
  * Allow an admin to enable email notification for certain sources
    or channels.
  * Allow beeps to include a property `extraInfo.htmlDetails`. If this
    property is set, the web interface would indicate that and allow the
    admin to click to view the details. The html would then be rendered
    in another view. This means that a source could send a beep whose
    contents are more like a "summary", and include a detailed html report
    in the `htmlDetails` field.
  * Allow admins to better secure their Beeper installation, by disabling
    the `anonymous` token and explicitly creating and granting tokens to
    systems they wish to allow access.
  * Allow admins to better secure the Beeper webapp, by requiring a password
    or maybe a user/password combination, or OAuth2 identities.