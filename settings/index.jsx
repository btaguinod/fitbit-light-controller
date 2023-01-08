registerSettingsPage(({ settings }) => (
  <Page>
    <Section
      title={
        <Text bold align="center">
          Connection Settings
        </Text>
      }
    >
      <TextInput
        label="WIFI Lights IP"
        settingsKey="ip"
        placeholder="ex. 10.0.0.148"
      />
    </Section>
  </Page>
));
