import { Link } from 'react-router-dom';
function HeroPage() {
    return (
        <div className="container " style={{paddingTop:'15vh' }}>
            <div className="row text-center mt-5">
                <h1 className="text-primary fw-bold">Video Conferencing Made Simple</h1>
                <h5 className=" mt-2 text-muted">Connect with your team, clients, and friends with Let-s-VC. <br></br> High-Quality video meetings that just work.</h5>
                <div className="mb-3 items-center g-3">
                    <Link to="" className=" mt-3 btn btn-primary justify-center">
                        Start a Meeting
                    </Link>
                    <Link variant="outline" className="mt-3 ms-3 btn btn-light">
                        Schedule Meeting
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HeroPage;