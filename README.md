# <picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-dark.svg"><img alt="calp.pro icon" src="https://cdn.jsdelivr.net/npm/uniswap-v2-loader@5.0.1/logo-light.svg" height="32" align="absmiddle"></picture>&nbsp;&nbsp;DEX DB&nbsp;&nbsp;[![Coverage](https://coveralls.io/repos/github/calp-pro/dex_db/badge.svg?branch=main)](https://coveralls.io/github/calp-pro/dex_db)

Database for decentralize exchangers.<br>
Each pair & token address indexed to a number.<br>
Then [factory](https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Factory.sol) information can be presented as:
- `0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc` - have index **N**
- `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` - have index **X**
- `0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2` - have index **Y**
```
data_structure[N    ] = X
data_structure[N + 1] = Y
```
where **N**, **X**, **Y** are `uint24`.

Example:<br>
`[0, 4, 0, 1, 5, 3, ...]`<br>
where:<br>
- `0, 4`
  * is first and second element at array at index `0`, `1` (pair index `0`)
  * `0` index of `token0` of pair 0
  * `4` index of `token1` of pair 0
- `0, 1`
  * is next pair of token at positions `2`, `3` (pair index `1`)
  * `0` index of `token0` of pair 1 (same token can be at different pairs)
  * `1` index of `token1` of pair `1`
- `5, 3`
  * is next pair of tokens at positions `4`, `5` (pair index `2`)
  * `5` index of `token0` of pair `2`
  * `3` index of `token1` of pair `2`

## Install
```bash
npm i --save dex-db
```

## Use
```js
import dex_db from 'dex-db'

const db = dex_db(
    [
        ['0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
        ['0x12ede161c702d1494612d19f05992f43aa6a26fb', '0x06af07097c9eeb7fd685c692751d5c66db49c215', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
        ['0xa478c2975ab1ea89e8196811f51a7b7ade33eb11', '0x6b175474e89094c44da98b954eedeac495271d0f', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
        ['0x07f068ca326a469fc1d87d85d448990c8cba7df9', '0x408e41876cccdc0f92210600ef50372656052a38', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
        ['0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5', '0x6b175474e89094c44da98b954eedeac495271d0f', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
        ['0xce407cd7b95b39d3b4d53065e711e713dd5c5999', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xfa3e941d1f6b7b10ed84a0c211bfa8aee907965e']
    ]
)

const pairs = dex_db.find_pairs_with_token('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'/*USDC*/)

//pairs[0] == '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc'/*WETH/USDC*/)
//pairs[1] == '0x07f068ca326a469fc1d87d85d448990c8cba7df9'/*REN/USDC*/)
//pairs[2] == '0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5'/*DAI/USDC*/)
```

## API
- `find_pairs_with_token`
- `find_pairs_with_tokens`
- `get_pair_tokens`
- `index`
- `index_save`
- `save`
- `load`
- `sort`

### `sort`
Compression of deltas five only 10% which is not much for 10mb of tokens/pools addresses.
Delivery to web 9mb or 10mb is same long waiting time which is user will wait.
Loading should happen in background and each loaded chunk should be processed.
Then very important is order of data which came first. Sorting of data helps to present fast most important data and less important left for later.

By default token sorting is done by amount of pairs token have. WETH is top paired token - should appear first at sorted result.
By default pair sorting is done by total pairs token0/1 have.

