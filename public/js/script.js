const body = document.querySelector('body')
const hamburgerMenu = document.querySelector('#hamburgerMenu')
const header = document.querySelector('.header')
const fadeElements = document.querySelectorAll('.has-fade')
const transferButton = document.querySelector('#transferButton')
const transferModal = document.querySelector('#transferModal')
const modalCloseBtn = document.querySelector('#modalCloseBtn')
const modalContent = document.querySelector('.modalContent')
const form = document.querySelector('.formContainer')

hamburgerMenu.addEventListener('click', () => {
    if (header.classList.contains('open')) {
        header.classList.remove('open')
        body.classList.remove('disable-scroll')

        for (let elem of fadeElements) {
            elem.classList.remove('fade-in')
            elem.classList.add('fade-out')
        }
    } else {
        header.classList.add('open')
        body.classList.add('disable-scroll')

        for (let elem of fadeElements) {
            elem.classList.add('fade-in')
            elem.classList.remove('fade-out')
        }
    }
})
if (transferButton) {
    transferButton.addEventListener('click', () => {
        transferModal.classList.remove('fade-out')
        transferModal.classList.add('fade-in')
        transferModal.style.display = 'block'

        modalContent.children[1].style.display = 'block'
        modalContent.children[2].style.display = 'block'
        modalContent.children[3]
            ? (modalContent.children[3].remove(), form.reset())
            : ''

        setTimeout(() => {
            document.querySelector('#sender').focus()
        }, 200)
    })
    modalCloseBtn.addEventListener('click', () => {
        transferModal.classList.remove('fade-in')
        transferModal.classList.add('fade-out')
        setTimeout(() => {
            transferModal.style.display = 'none'
        }, 200)
    })
}
window.addEventListener('click', (e) => {
    if (e.target == transferModal) {
        transferModal.classList.remove('fade-in')
        transferModal.classList.add('fade-out')
        setTimeout(() => {
            transferModal.style.display = 'none'
        }, 200)
    }
})

const displayAccounts = async () => {
    try {
        const { data } = await axios.get('/data/accounts')

        if (!data.length) {
            throw new Error('No Data')
        }
        const tableBody = document.querySelector('#tbody-accounts')
        tableBody.replaceChildren()
        for (let i of data) {
            const row = document.createElement('tr')
            row.innerHTML = `
            <td label='ID'>${i.id}</td>
            <td label='Name'>${i.name}</td>
            <td label='Email'>${i.email}</td>
            <td label='Balance'>₹${i.balance}</td>`

            tableBody.appendChild(row)
        }
    } catch (error) {
        console.log(`error`, error)
        document.querySelector('thead').style.display = 'none'
        const errElem = document.createElement('div')
        errElem.innerHTML = `<h3 id='errorMsg'>${error.message}</h3>`
        document.querySelector('body').appendChild(errElem)
    }
}
const displayTransactions = async () => {
    try {
        const { data } = await axios.get('/data/transactions')

        if (!data.length) {
            throw new Error('No Data')
        }
        const tableBody = document.querySelector('#tbody-transactions')
        tableBody.replaceChildren()
        for (let i of data) {
            const row = document.createElement('tr')
            const dtVal = new Date(i.timestamp)
            const date = dtVal.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
            })
            row.innerHTML = `
            <td label='ID'>${i.transaction_id}</td>
            <td label='Sender'>${i.sender}</td>
            <td label='Receiver'>${i.receiver}</td>
            <td label='Amount'>₹${i.amount}</td>
            <td label='Date & Time'>${date}</td>`

            tableBody.appendChild(row)
        }
    } catch (error) {
        console.log(`error`, error)
        document.querySelector('thead').style.display = 'none'
        const errElem = document.createElement('div')
        errElem.innerHTML = `<h3 id='errorMsg'>${error.message}</h3>`
        document.querySelector('body').appendChild(errElem)
    }
}

if (location.pathname === '/accounts.html') {
    displayAccounts()
}

if (location.pathname === '/transactions.html') {
    displayTransactions()
}

form &&
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const sender = form.elements.fromAcc.value
        const recipient = form.elements.toAcc.value
        const amount = form.elements.amount.value

        if (document.querySelector('#errorMsg')) {
            document.querySelector('#errorMsg').parentElement.remove()
        }
        try {
            if (sender == recipient)
                throw new Error('Sender and Receiver cannot be same')

            const { data } = await axios.get('/data/accounts')
            const payer = data.find((user) => user.email === sender)
            const payee = data.find((user) => user.email === recipient)

            if (!payer || !payee) throw new Error('Invalid accounts')

            // console.log(payer, payee, amount)
            const { resPay, resReceive, errorMessage } = await transact(
                payer,
                payee,
                amount
            )
            // console.log(resPay, resReceive, errorMessage)
            resPay && resReceive
                ? modalChange('success', 'Success')
                : modalChange('error', errorMessage)
        } catch (error) {
            const errElem = document.createElement('div')
            errElem.innerHTML = `<p id='errorMsg'>${error.message}</p>`
            form.appendChild(errElem)
        }
    })

const transact = async (payer, payee, amount) => {
    try {
        const payData = { balance: payer.balance - parseInt(amount) }
        const receiveData = { balance: payee.balance + parseInt(amount) }
        const transaction = {
            sender: payer.email,
            receiver: payee.email,
            amount: amount,
        }
        // console.log(payData, receiveData, transaction)

        const { data: resPay } = await axios.put(
            `/data/accounts/${payer.id}`,
            payData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        const { data: resReceive } = await axios.put(
            `/data/accounts/${payee.id}`,
            receiveData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        const { data: transactionRes } = await axios.post(
            `/data/transactions`,
            transaction,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        return { resPay, resReceive, transactionRes }
    } catch (error) {
        console.log(error)
        return { errorMessage: error.response.data }
    }
}

const modalChange = async (type, messsage) => {
    modalContent.children[1].style.display = 'none'
    modalContent.children[2].style.display = 'none'

    const status = document.createElement('div')
    status.setAttribute('class', 'afterTransact fade-in flex')
    status.innerHTML = `<img src='./images/${type}.svg'>
    <p>${messsage}</p>`
    modalContent.appendChild(status)

    displayAccounts()
}
