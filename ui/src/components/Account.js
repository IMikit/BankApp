import React from 'react'
import { Card, CardTitle, CardActions } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import formatMoney from '../formatMoney'

const Account = ({ id, name, balance, viewTransactions }) => (
    <Card key={id}>
        <CardTitle title={name} subtitle={`Solde ${formatMoney(balance)}`} />
        <CardActions>
            <FlatButton onClick={() => viewTransactions(id)} label="Voir les transactions" primary={true} />
        </CardActions>
    </Card>
)

export default Account