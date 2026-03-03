/**
 * TypeScript type definitions for crx3
 */

import { Readable } from 'stream';

export interface CRX3Options {
  /**
   * Name used for files, if they are not specified otherwise.
   */
  name?: string;
  
  /**
   * Path name of output CRX file.
   * @default './web-extension.crx'
   */
  crxPath?: string;
  
  /**
   * Optional path name of output ZIP file.
   * @default ''
   */
  zipPath?: string;
  
  /**
   * Private key to be used for signing CRX file.
   * @default ''
   */
  keyPath?: string;
  
  /**
   * Optional path name of output Update Manifest XML file.
   * @default ''
   */
  xmlPath?: string;
  
  /**
   * Optional version name to be written into Update Manifest file.
   */
  appVersion?: string;
  
  /**
   * Path to the extension's src directory.
   */
  srcPath?: string | string[];
  
  /**
   * If set to true, output will be streamed to stdout.
   */
  stdout?: boolean;
  
  /**
   * If set to false, key will not be auto-generated.
   * @default true
   */
  autoKey?: boolean;
  
  /**
   * If set to false, CRX file will not be created.
   * @default true
   */
  crx?: boolean;
  
  /**
   * If set to false, ZIP file will not be created.
   * @default true
   */
  zip?: boolean;
  
  /**
   * If set to false, XML file will not be created.
   * @default true
   */
  xml?: boolean;
}

/**
 * Create CRX package from specified files.
 * 
 * Private key file will not be created if one already exist. In such case, existing one will be used.
 * CRX and ZIP files are always overwritten.
 * 
 * @param files - Array of file paths or a readable stream
 * @param options - Configuration options
 * @returns Promise that resolves when the CRX file is created
 */
export default function writeCRX3File(
  files: string[] | Readable,
  options?: CRX3Options
): Promise<void>;

/**
 * Create CRX package with options only.
 * 
 * @param options - Configuration options
 * @returns Promise that resolves when the CRX file is created
 */
export default function writeCRX3File(
  options: CRX3Options
): Promise<void>;
