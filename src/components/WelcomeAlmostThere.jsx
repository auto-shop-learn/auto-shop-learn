export const WelcomeAlmostThere = ({handleNext,handleBack}) => {
    return (
        <div className="welcomeGetStartedParent">
            <div className="welcomeGetStaredChild getStartedFormParent">
                <form action="" className="getStartedForm">
                    <div className="welcomeGetStartedInputField">
                        <label htmlFor="dateOfBirth" className="welcomeGetStartedInputLabe">Date Of Birth</label>
                        <input type="text" className="welcomeGetStartedInput" />
                    </div>
                    <div className="welcomeGetStartedInputField">
                        <label htmlFor="phoneNumber" className="welcomeGetStartedInputLabe">Cell Phone No.</label>
                        <input type="text" className="welcomeGetStartedInput"/>
                    </div>
                    <div className="welcomeGetStartedInputField">
                        <label htmlFor="gender" className="welcomeGetStartedInputLabe">Gender</label>
                        <select name="" id="" className="welcomeGetStartedInput"></select>
                    </div>
                    <div className="welcomeGetStartedInputField">
                        <label htmlFor="farmerType" className="welcomeGetStartedInputLabe">Type Of Farmer</label>
                        <select name="" id="" className="welcomeGetStartedInput"></select>
                    </div>
                    
                    <div className="button-container">
                        <button type="submit" className="welcomeGetStartedPageButton welcomeGetStartedPageButton-1"  onClick={() => handleBack()}>Back</button>
                        <button type="submit" className="welcomeGetStartedPageButton welcomeGetStartedPageButton-2"  onClick={() => handleNext()}>Next</button>
                    </div>

                </form>
            </div>
            <div className="welcomeGetStaredChild getStartedImage"></div>
            
        </div>

);
}