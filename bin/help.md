Global options:
    -v              Verbose output
    --config        Specify config file. Default is ./config.yaml

Commands:

  accounts
    ls              List account
    create          Create account
    update          Update account

  tokens
    ls              List tokens
    create          Create token
    delete          Delete token

  subs[criptions]
    ls              List subscription rules
                    (for all accounts; for just one, use --account <code>)
    add             Add a subscription:
                    --account <code> --email <true|false> --sms <true|false>
    remove          Remove a subscription
                    --account <code> --sub <index>
    crit            Modify the criteria for a subscription:
                    --account <code> --sub <index>
                      --all <true|false>
                      --tags <required-tags|null>
                      --source <required-source|null>
