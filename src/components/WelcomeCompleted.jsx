export const WelcomeCompleted = ({handleBack}) => {
    
    return (
        <div className="welcomeGetStartedParent">
            <div className="welcomeGetStaredChild getStartedFormParent">
                <form action="" className="getStartedForm">

                    <div className="getStartedUploadImage">
                        <div className="uploadImageItems uploadImageItem-1">Profile Photo</div>
                        <div className="uploadImageItems uploadImageItem-2"></div>
                        <div className="uploadImageItems uploadImageItem-3">Remove</div>
                        <div className="uploadImageItems uploadImageItem-4">Update</div>
                    </div>
                    <div className="welcomeGetStartedInputField">
                        <label htmlFor="userName" className="welcomeGetStartedInputLabe">User Name</label>
                        <input type="text" className="welcomeGetStartedInput" />
                    </div>
                   
                    
                    <div className="button-container">
                        <button type="submit" className="welcomeGetStartedPageButton welcomeGetStartedPageButton-1" onClick={() => handleBack()}>Back</button>
                        <button type="submit" className="welcomeGetStartedPageButton welcomeGetStartedPageButton-2">Next</button>
                    </div>

                </form>
            </div>
            <div className="welcomeGetStaredChild getStartedImage"></div>
            
        </div>

);
}