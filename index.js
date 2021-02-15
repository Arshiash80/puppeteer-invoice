const fs = require('fs')
const path = require('path')
const utils = require('util')
const puppeteer = require('puppeteer')
const ejs = require('ejs')
const readFile = utils.promisify(fs.readFile)

async function getTemplateHtml() {
    console.log("Loading template file in memory")
    try {
        const invoicePath = path.resolve("./invoice.ejs");
        return await readFile(invoicePath, 'utf8');
    } catch (err) {
        return Promise.reject("Could not load html template");
    }
}


async function generatePdf() {

    let data = {
        address: {
            restaurantName: "Bilmem ne restorani",
            specification: "bilmem ne sokak / bilmem nemahallesi",
            postcode: "123456"
        },
        invoice: {
            date: "02/01/2021",
            no: "1001"
        },
        wasteOil: {
            code: "123213213123",
            liters: "20",
            payment: 999.81
        },
        barrelSizesList: [
            5,10,100
        ],
        productsList: [
            "bu yag","su yag","az yag"
        ],
        qtyList: [
            1,4,1
        ],
        priceList: [
            10, 19, 88.77
        ],
        totalPrice: 999
    };

    getTemplateHtml()
        .then(async (res) => {
            // Now we have the html code of our template in res object
            // you can check by logging it on console
            // console.log(res)

            console.log("Compiling the template with ejs")
            const template = ejs.compile(res);
            // we have compile our code with ejs
            const result = template(data);
            // We can use this to add dyamic data to our ejs template at run time from database or API as per need.
            const html = result;
            // we are using ejs mode 
            const browser = await puppeteer.launch();
            const page = await browser.newPage()

            // We set the page content as the generated html by ejs
            await page.setContent(html)

            // we Use pdf function to generate the pdf in the same folder as this file. 
            const buffer = await page.pdf({ path: 'invoice.pdf',format: 'A4' , printBackground: true}) 
            // You can remove path if you want just a pdf buffer.
            console.log("Invoice pdf : \n", buffer)
            // NOTE: printBackground: true is important** to render css correctly.

            await browser.close();
            console.log("PDF Generated")
        })
        .catch(err => {
            console.error(err)
        });
}

generatePdf();