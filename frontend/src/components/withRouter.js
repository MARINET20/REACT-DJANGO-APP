import React from "react";
import { useParams } from "react-router-dom";

const withRouter = WrappedCommponent => props => {
    const params = useParams();

    return(
        <WrappedCommponent
            {...props}
            params={params}
        />
    );
};

export default withRouter;