import { TestBed } from '@angular/core/testing';
import { getRequiredElement } from '@shared/testing/dom';
import { LoadingOverlay } from './loading-overlay';

describe('LoadingOverlay', () => {
  it('blocks interaction with projected content while loading', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [LoadingOverlay],
    }).createComponent(LoadingOverlay);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const content = getRequiredElement(nativeElement, '.overlay-content');
    expect(content.hasAttribute('inert')).toBe(true);
    expect(getRequiredElement(nativeElement, '.overlay-host').getAttribute('aria-busy')).toBe(
      'true',
    );

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    expect(content.hasAttribute('inert')).toBe(false);
  });
});
