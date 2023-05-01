const axios = require('axios');
const cheerio = require('cheerio');

async function parsePages() {
  const baseUrl = 'https://www.vintagesshoponline.com/vintages/Public/OrderProgramProducts.aspx';
  const params = { programId: 803, pageSize: 100 };

  const rows = [];
  let currentPage = 1;

  while (true) {
    const response = await axios.get(baseUrl, { params: { ...params, pageNumber: currentPage } })
      .catch(error => {
        console.error(`Error fetching page ${currentPage}: ${error.message}`);
        return null; // return null to indicate failure
      });

    if (response === null) {
      // fetch failed, stop parsing
      break;
    }

    const html = response.data;
    const $ = cheerio.load(html);

    const pageRows = $('table tbody tr').get().map(row => {
      const columns = $(row).find('td').get().map(column => $(column).text().trim());
      return { product: columns[0], vintage: columns[1], price: columns[2], quantity: columns[3] };
    });

    if (pageRows.length === 0) {
      // no more rows on this page, stop parsing
      break;
    }

    rows.push(...pageRows);
    currentPage++;
  }

  return rows;
}

parsePages().then(data => console.log(data));
