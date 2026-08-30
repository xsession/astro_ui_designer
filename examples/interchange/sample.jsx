export default function App(){
  return (
    <main>
      <div style={{"width":"100%","padding":"14px 24px","borderBottom":"1px solid var(--color-border)","background":"var(--color-surface)"}}>
        <div style={{"display":"flex","gap":"12px","alignItems":"center","maxWidth":"1120px","margin":"0 auto","justifyContent":"space-between"}}>
          <h2 style={{"margin":"0","fontSize":"18px","lineHeight":"1.15","fontWeight":"700"}}>Astro UI Designer</h2>
          <div style={{"display":"flex","flexDirection":"row","gap":"14px","alignItems":"center","justifyContent":"flex-start","flexWrap":"wrap"}}>
            <div style={{"color":"var(--color-primary)","textDecoration":"none","fontWeight":"600"}}></div>
            <div style={{"color":"var(--color-primary)","textDecoration":"none","fontWeight":"600"}}></div>
          </div>
        </div>
      </div>
      <div style={{"width":"100%","padding":"48px 24px","background":"linear-gradient(135deg,#eef5fb 0%,#fff 68%)"}}>
        <div style={{"width":"100%","maxWidth":"1120px","margin":"0 auto"}}>
          <div style={{"display":"flex","flexDirection":"row","gap":"36px","alignItems":"center","justifyContent":"flex-start","flexWrap":"nowrap"}}>
            <div style={{"display":"flex","flexDirection":"column","gap":"18px","alignItems":"stretch","flex":"1 1 560px"}}>
              <div style={{"display":"inline-flex","padding":"4px 8px","borderRadius":"999px","background":"var(--color-muted)","fontSize":"12px","fontWeight":"600"}}></div>
              <h2 style={{"margin":"0","fontSize":"52px","lineHeight":"1.15","fontWeight":"700","maxWidth":"780px"}}>Build responsive Astro interfaces visually.</h2>
              <p style={{"margin":"0","fontSize":"18px","lineHeight":"1.55","maxWidth":"720px","color":"#4b5563"}}>Qt Creator-style workflow, web-native layout rules, reusable components, responsive states, actions, assets and clean Astro output.</p>
              <div style={{"display":"flex","flexDirection":"row","gap":"10px","alignItems":"center","justifyContent":"flex-start","flexWrap":"wrap"}}>
                <div style={{"display":"inline-flex","alignItems":"center","justifyContent":"center","padding":"10px 16px","border":"1px solid var(--color-primary)","borderRadius":"var(--radius-sm)","background":"var(--color-primary)","color":"#fff","fontWeight":"600","cursor":"pointer"}}></div>
                <div style={{"color":"var(--color-primary)","textDecoration":"none","fontWeight":"600","padding":"10px 12px"}}></div>
              </div>
            </div>
            <div style={{"padding":"24px","border":"1px solid var(--color-border)","borderRadius":"var(--radius-md)","background":"#17202a","boxShadow":"var(--shadow-sm)","flex":"1 1 360px","minHeight":"280px","display":"flex","flexDirection":"column","justifyContent":"center","gap":"12px","color":"#fff"}}>
              <h2 style={{"margin":"0","fontSize":"22px","lineHeight":"1.15","fontWeight":"700"}}>Source-first output</h2>
              <p style={{"margin":"0","fontSize":"16px","lineHeight":"1.55","color":"#cfd8e3"}}>Generated pages, components, layouts, CSS, assets and client actions stay readable and editable.</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{"width":"100%","padding":"48px 24px"}}>
        <div style={{"width":"100%","maxWidth":"1120px","margin":"0 auto"}}>
          <h2 style={{"margin":"0","fontSize":"32px","lineHeight":"1.15","fontWeight":"700"}}>A full visual frontend IDE</h2>
          <div style={{"height":"24px","width":"100%"}}></div>
          <div style={{"display":"grid","gridTemplateColumns":"repeat(3,minmax(0,1fr))","gap":"20px"}}>
            <div style={{"padding":"24px","border":"1px solid var(--color-border)","borderRadius":"var(--radius-md)","background":"var(--color-surface)","boxShadow":"var(--shadow-sm)"}}>
              <h2 style={{"margin":"0","fontSize":"20px","lineHeight":"1.15","fontWeight":"700"}}>Responsive layout</h2>
              <p style={{"margin":"0","fontSize":"16px","lineHeight":"1.55"}}>Flex, Grid, breakpoints and freeform HMI layers.</p>
            </div>
            <div style={{"padding":"24px","border":"1px solid var(--color-border)","borderRadius":"var(--radius-md)","background":"var(--color-surface)","boxShadow":"var(--shadow-sm)"}}>
              <h2 style={{"margin":"0","fontSize":"20px","lineHeight":"1.15","fontWeight":"700"}}>Reusable components</h2>
              <p style={{"margin":"0","fontSize":"16px","lineHeight":"1.55"}}>Create project components with slots and instance overrides.</p>
            </div>
            <div style={{"padding":"24px","border":"1px solid var(--color-border)","borderRadius":"var(--radius-md)","background":"var(--color-surface)","boxShadow":"var(--shadow-sm)"}}>
              <h2 style={{"margin":"0","fontSize":"20px","lineHeight":"1.15","fontWeight":"700"}}>Behavior</h2>
              <p style={{"margin":"0","fontSize":"16px","lineHeight":"1.55"}}>State variables, bindings and web-native signal/action connections.</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{"padding":"24px","border":"1px solid #64748b","borderRadius":"var(--radius-md)","background":"#ffffff","boxShadow":"0px 8px 22px 0px rgba(0,0,0,.28)","width":"320px","height":"180px","mixBlendMode":"normal"}}></div>
    </main>
  );
}
