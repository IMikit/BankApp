import React from 'react'
import FlatButton from 'material-ui/FlatButton'

const Logout = ({ visible, onClick }) => (
    <span>
        {
            visible &&
            <FlatButton label="Se déconnecter" onClick={onClick} />
        }
    </span>
)

export default Logout