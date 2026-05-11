function Everything() {
    return (
        <>
        <div className="container text-center" style={{marginTop:"16vh"}}>
            <h1 className="fw-bold mb-5">Everything you need for productive meetings.</h1>
            <div className="row mt-2 g-3">
    
    <div className="col-md-4">
        <div className="card h-100 p-3 text-start">
            <div className="card-body">
                <div
                    className="d-flex align-items-center justify-content-center mb-3"
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#75b0e662"
                    }}
                >
                    <i className="fa-solid fa-video"></i>
                </div>

                <h5 className="card-title">HD Video Quality</h5>
                <p className="card-text text-muted">
                    Crystal clear video and audio for seamless communication
                </p>
            </div>
        </div>
    </div>

    <div className="col-md-4">
        <div className="card h-100 p-3 text-start">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-center mb-3"
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#cef7c0"
                    }}>
                    <i className="fa-solid fa-users"></i>
                </div>

                <h5 className="card-title">Group Meetings</h5>
                <p className="card-text text-muted">
                    Connect with multiple participants effortlessly
                </p>
            </div>
        </div>
    </div>

    <div className="col-md-4">
        <div className="card h-100 p-3 text-start">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-center mb-3"
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#fccdd6"
                    }}>
                    <i className="fa-solid fa-bolt"></i>
                </div>

                <h5 className="card-title">Fast Performance</h5>
                <p className="card-text text-muted">
                    Lightning-fast connections with minimal lag
                </p>
            </div>
        </div>
    </div>

</div>



        </div>
        </>
     );
}

export default Everything;