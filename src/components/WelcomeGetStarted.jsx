export const WelcomeGetStarted = ({handleNext}) => {

    return (
            <div className="welcomeGetStartedParent">
                <div className="welcomeGetStaredChild getStartedFormParent">
                    <form action="" className="getStartedForm">
                        <div className="welcomeGetStartedInputField">
                            <label htmlFor="farmName" className="welcomeGetStartedInputLabe">Farm Name</label>
                            <input type="text" className="welcomeGetStartedInput" />
                        </div>
                        <div className="welcomeGetStartedInputField">
                            <label htmlFor="address" className="welcomeGetStartedInputLabe">Address</label>
                            <input type="text" className="welcomeGetStartedInput"/>
                        </div>
                        <div className="welcomeGetStartedInputField">
                            <label htmlFor="country" className="welcomeGetStartedInputLabe">Country</label>
                            <select name="" id="" className="welcomeGetStartedInput"></select>
                        </div>
                        <div className="welcomeGetStartedInputField">
                            <label htmlFor="district" className="welcomeGetStartedInputLabe">District</label>
                            <input type="text" className="welcomeGetStartedInput"/>
                        </div>
                        <div className="welcomeGetStartedInputField">
                            <label htmlFor="city" className="welcomeGetStartedInputLabe">City</label>
                            <input type="text"className="welcomeGetStartedInput"/>
                        </div>
                        <button type="submit" className="welcomeGetStartedPageButton welcomeGetStartedPageButton-2" onClick={() => handleNext()}>Next</button>
                    </form>
                </div>
                <div className="welcomeGetStaredChild getStartedImage"></div>
                
            </div>
    
    );
}