import { NextRequest, NextResponse } from 'next/server';

// ─── Force dynamic rendering (fixes Next.js 16 "Failed to find Server Action" bug) ──
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { cid, record_type } = await request.json();

    if (!cid || typeof cid !== 'number' || cid <= 0) {
      return NextResponse.json(
        { error: 'Valid PubChem CID is required.' },
        { status: 400 }
      );
    }

    let sdf = '';
    let recordType = '';

    // Try 3D first
    if (record_type !== '2d') {
      try {
        const url3d = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;
        const res = await fetch(url3d, { signal: AbortSignal.timeout(20000) });
        if (res.ok) {
          const text = await res.text();
          if (text.trim().length > 50 && (text.includes('ATOM') || text.includes('M  END'))) {
            sdf = text;
            recordType = '3d';
          }
        }
      } catch { /* fallback to 2D */ }
    }

    // Fallback to 2D
    if (!sdf) {
      try {
        const url2d = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=2d`;
        const res = await fetch(url2d, { signal: AbortSignal.timeout(15000) });
        if (res.ok) {
          const text = await res.text();
          if (text.trim().length > 50 && (text.includes('ATOM') || text.includes('M  END'))) {
            sdf = text;
            recordType = '2d';
          }
        }
      } catch { /* no SDF available */ }
    }

    if (!sdf) {
      return NextResponse.json(
        { error: `No SDF data available for CID ${cid}. This compound may not have 3D conformer data in PubChem.`, sdf: '', recordType: '' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sdf, recordType });
  } catch (error) {
    console.error('SDF proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch SDF data.' }, { status: 500 });
  }
}
