
export const WelcomeHeader = () => {
    const styles = {
        spanText : {
            color: '#34A853'
        }
    }
    return (
        <div className="welcomeParent">
            <div className="welcomeChild welcomeChild-1">
            <h1 className="welcomeH1">Welcome to <span  style={styles.spanText}>Smart Farm</span></h1>
            <p className="welcomeP">Let's get started. Tell us about your farm and preferences.</p>
            </div>
            <div className="welcomeChild welcomeChild-2">
                <div className="iconItems icon1">
                    <div className="icon-text">Get Started</div>
                </div>
                <div className="iconItems icon2">
                    <div className="icon-text">Almost There</div>
                </div>
                <div className="iconItems icon3">
                    <div className="icon-text">Completed</div>
                </div>
                </div>
            </div>
    );
}