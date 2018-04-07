from rabbit.rpc import RPC

defaults = {
    'queue': {
        'passive': False,
        'durable': True,
        'exclusive': False,
        'autoDelete': True,
        'nowait': False
    },
    'consumer': {
        'noLocal': False,
        'noAck': False,
        'exclusive': False,
        'nowait': False
    }
}


def rpc(name, server):
    conf = defaults
    conf['server'] = server

    return RPC(name, conf)
